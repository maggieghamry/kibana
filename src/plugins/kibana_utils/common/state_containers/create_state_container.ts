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

import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import deepFreeze from 'deep-freeze-strict';
import {
  PureTransitionsToTransitions,
  PureTransition,
  ReduxLikeStateContainer,
  PureSelectorsToSelectors,
  BaseState,
} from './types';

const $$observable = (typeof Symbol === 'function' && (Symbol as any).observable) || '@@observable';
const $$setActionType = '@@SET';

const isProduction =
  typeof window === 'object'
    ? process.env.NODE_ENV === 'production'
    : !process.env.NODE_ENV || process.env.NODE_ENV === 'production';

const defaultFreeze: <T>(value: T) => T = isProduction
  ? <T>(value: T) => value as T
  : <T>(value: T): T => {
      const isFreezable = value !== null && typeof value === 'object';
      if (isFreezable) return deepFreeze(value) as T;
      return value as T;
    };

export interface CreateStateContainerOptions {
  /**
   * Function to use when freezing state. Supply identity function
   *
   * ```ts
   * {
   *   freeze: state => state,
   * }
   * ```
   *
   * if you expect that your state will be mutated externally an you cannot
   * prevent that.
   */
  freeze?: <T>(state: T) => T;
}

export function createStateContainer<State extends BaseState>(
  defaultState: State
): ReduxLikeStateContainer<State>;
export function createStateContainer<State extends BaseState, PureTransitions extends object>(
  defaultState: State,
  pureTransitions: PureTransitions
): ReduxLikeStateContainer<State, PureTransitions>;
export function createStateContainer<
  State extends BaseState,
  PureTransitions extends object,
  PureSelectors extends object
>(
  defaultState: State,
  pureTransitions: PureTransitions,
  pureSelectors: PureSelectors,
  options?: CreateStateContainerOptions
): ReduxLikeStateContainer<State, PureTransitions, PureSelectors>;
export function createStateContainer<
  State extends BaseState,
  PureTransitions extends object,
  PureSelectors extends object
>(
  defaultState: State,
  pureTransitions: PureTransitions = {} as PureTransitions,
  pureSelectors: PureSelectors = {} as PureSelectors,
  options: CreateStateContainerOptions = {}
): ReduxLikeStateContainer<State, PureTransitions, PureSelectors> {
  const { freeze = defaultFreeze } = options;
  const data$ = new BehaviorSubject<State>(freeze(defaultState));
  const state$ = data$.pipe(skip(1));
  const get = () => data$.getValue();
  const container: ReduxLikeStateContainer<State, PureTransitions, PureSelectors> = {
    get,
    state$,
    getState: () => data$.getValue(),
    set: (state: State) => {
      container.dispatch({ type: $$setActionType, args: [state] });
    },
    reducer: (state, action) => {
      if (action.type === $$setActionType) {
        return freeze(action.args[0] as State);
      }

      const pureTransition = (pureTransitions as Record<string, PureTransition<State, any[]>>)[
        action.type
      ];
      return pureTransition ? freeze(pureTransition(state)(...action.args)) : state;
    },
    replaceReducer: nextReducer => (container.reducer = nextReducer),
    dispatch: action => data$.next(container.reducer(get(), action)),
    transitions: Object.keys(pureTransitions).reduce<PureTransitionsToTransitions<PureTransitions>>(
      (acc, type) => ({ ...acc, [type]: (...args: any) => container.dispatch({ type, args }) }),
      {} as PureTransitionsToTransitions<PureTransitions>
    ),
    selectors: Object.keys(pureSelectors).reduce<PureSelectorsToSelectors<PureSelectors>>(
      (acc, selector) => ({
        ...acc,
        [selector]: (...args: any) => (pureSelectors as any)[selector](get())(...args),
      }),
      {} as PureSelectorsToSelectors<PureSelectors>
    ),
    addMiddleware: middleware =>
      (container.dispatch = middleware(container as any)(container.dispatch)),
    subscribe: (listener: (state: State) => void) => {
      const subscription = state$.subscribe(listener);
      return () => subscription.unsubscribe();
    },
    [$$observable]: state$,
  };
  return container;
}
