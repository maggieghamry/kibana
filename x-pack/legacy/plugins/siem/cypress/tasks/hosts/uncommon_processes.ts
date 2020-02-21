/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { UNCOMMON_PROCESSES_TABLE } from '../../screens/hosts/uncommon_processes';

export const waitForUncommonProcessesToBeLoaded = () => {
  cy.get(UNCOMMON_PROCESSES_TABLE).should('exist');
};
