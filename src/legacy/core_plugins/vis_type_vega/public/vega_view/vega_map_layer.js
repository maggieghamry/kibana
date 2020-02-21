/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import L from 'leaflet';
import 'leaflet-vega';
import { KibanaMapLayer } from '../legacy_imports';

export class VegaMapLayer extends KibanaMapLayer {
  constructor(spec, options) {
    super();

    // Used by super.getAttributions()
    this._attribution = options.attribution;
    delete options.attribution;

    this._leafletLayer = L.vega(spec, options);
  }

  getVegaView() {
    return this._leafletLayer._view;
  }

  getVegaSpec() {
    return this._leafletLayer._spec;
  }
}
