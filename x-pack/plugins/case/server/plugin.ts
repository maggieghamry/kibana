/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { first, map } from 'rxjs/operators';
import { Logger, PluginInitializerContext } from 'kibana/server';
import { CoreSetup } from 'src/core/server';

import { SecurityPluginSetup } from '../../security/server';

import { ConfigType } from './config';
import { initCaseApi } from './routes/api';
import {
  caseSavedObjectType,
  caseConfigureSavedObjectType,
  caseCommentSavedObjectType,
} from './saved_object_types';
import { CaseConfigureService, CaseService } from './services';

function createConfig$(context: PluginInitializerContext) {
  return context.config.create<ConfigType>().pipe(map(config => config));
}

export interface PluginsSetup {
  security: SecurityPluginSetup;
}

export class CasePlugin {
  private readonly log: Logger;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.log = this.initializerContext.logger.get();
  }

  public async setup(core: CoreSetup, plugins: PluginsSetup) {
    const config = await createConfig$(this.initializerContext)
      .pipe(first())
      .toPromise();

    if (!config.enabled) {
      return;
    }

    core.savedObjects.registerType(caseSavedObjectType);
    core.savedObjects.registerType(caseCommentSavedObjectType);
    core.savedObjects.registerType(caseConfigureSavedObjectType);

    const caseServicePlugin = new CaseService(this.log);
    const caseConfigureServicePlugin = new CaseConfigureService(this.log);

    this.log.debug(
      `Setting up Case Workflow with core contract [${Object.keys(
        core
      )}] and plugins [${Object.keys(plugins)}]`
    );

    const caseService = await caseServicePlugin.setup({
      authentication: plugins.security.authc,
    });
    const caseConfigureService = await caseConfigureServicePlugin.setup();

    const router = core.http.createRouter();
    initCaseApi({
      caseConfigureService,
      caseService,
      router,
    });
  }

  public start() {
    this.log.debug(`Starting Case Workflow`);
  }

  public stop() {
    this.log.debug(`Stopping Case Workflow`);
  }
}
