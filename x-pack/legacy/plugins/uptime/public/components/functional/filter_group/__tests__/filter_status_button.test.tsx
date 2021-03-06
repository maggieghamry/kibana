/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { FilterStatusButton, FilterStatusButtonProps } from '../filter_status_button';
import { shallowWithRouter } from '../../../../lib/';

describe('FilterStatusButton', () => {
  let props: FilterStatusButtonProps;
  beforeEach(() => {
    props = {
      content: 'Up',
      dataTestSubj: 'foo',
      value: 'up',
      withNext: true,
    };
  });

  it('renders without errors for valid props', () => {
    const wrapper = shallowWithRouter(<FilterStatusButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
