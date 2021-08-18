/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';
import type { ExceptionListItemSchema } from '@kbn/securitysolution-io-ts-list-types';
import { TrustedApp } from '../../../common/endpoint/types';
import { PackagePolicy } from '../../../../fleet/common/types/models/package_policy';
import { EndpointExceptionListItem, ListTemplate } from './types';
import { LIST_ENDPOINT_EXCEPTION, LIST_ENDPOINT_EVENT_FILTER } from './constants';

/**
 * Determines the when the last run was in order to execute to.
 *
 * @param executeTo
 * @param lastExecutionTimestamp
 * @returns the timestamp to search from
 */
export const getPreviousDiagTaskTimestamp = (
  executeTo: string,
  lastExecutionTimestamp?: string
) => {
  if (lastExecutionTimestamp === undefined) {
    return moment(executeTo).subtract(5, 'minutes').toISOString();
  }

  if (moment(executeTo).diff(lastExecutionTimestamp, 'minutes') >= 10) {
    return moment(executeTo).subtract(10, 'minutes').toISOString();
  }

  return lastExecutionTimestamp;
};

/**
 * Determines the when the last run was in order to execute to.
 *
 * @param executeTo
 * @param lastExecutionTimestamp
 * @returns the timestamp to search from
 */
export const getPreviousEpMetaTaskTimestamp = (
  executeTo: string,
  lastExecutionTimestamp?: string
) => {
  if (lastExecutionTimestamp === undefined) {
    return moment(executeTo).subtract(24, 'hours').toISOString();
  }

  if (moment(executeTo).diff(lastExecutionTimestamp, 'hours') >= 24) {
    return moment(executeTo).subtract(24, 'hours').toISOString();
  }

  return lastExecutionTimestamp;
};

/**
 * Chunks an Array<T> into an Array<Array<T>>
 * This is to prevent overloading the telemetry channel + user resources
 *
 * @param telemetryRecords
 * @param batchSize
 * @returns the batch of records
 */
export const batchTelemetryRecords = (
  telemetryRecords: unknown[],
  batchSize: number
): unknown[][] =>
  [...Array(Math.ceil(telemetryRecords.length / batchSize))].map((_) =>
    telemetryRecords.splice(0, batchSize)
  );

/**
 * User defined type guard for PackagePolicy
 *
 * @param data the union type of package policies
 * @returns type confirmation
 */
export function isPackagePolicyList(
  data: string[] | PackagePolicy[] | undefined
): data is PackagePolicy[] {
  if (data === undefined || data.length < 1) {
    return false;
  }

  return (data as PackagePolicy[])[0].inputs !== undefined;
}

/**
 * Maps Exception list item to telemetry payload
 *
 * @param exceptionListItem
 * @returns
 */
export const exceptionListItemToEndpointEntry = (exceptionListItem: ExceptionListItemSchema) => {
  return {
    id: exceptionListItem.id,
    version: exceptionListItem._version || '',
    name: exceptionListItem.name,
    description: exceptionListItem.description,
    created_at: exceptionListItem.created_at,
    created_by: exceptionListItem.created_by,
    updated_at: exceptionListItem.updated_at,
    updated_by: exceptionListItem.updated_by,
  } as EndpointExceptionListItem;
};

export const templateEndpointExceptions = (
  listData: EndpointExceptionListItem[],
  listType: string
) => {
  return listData.map((item) => {
    const template: ListTemplate = {
      trusted_application: [],
      endpoint_exception: [],
      endpoint_event_filter: [],
    };

    if (listType === LIST_ENDPOINT_EXCEPTION) {
      template.endpoint_exception.push(item);
      return template;
    }

    if (listType === LIST_ENDPOINT_EVENT_FILTER) {
      template.endpoint_event_filter.push(item);
      return template;
    }

    return null;
  });
};

export const templateTrustedApps = (listData: TrustedApp[]) => {
  return listData.map((item) => {
    const template: ListTemplate = {
      trusted_application: [],
      endpoint_exception: [],
      endpoint_event_filter: [],
    };

    template.trusted_application.push(item);
    return template;
  });
};
