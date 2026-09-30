'use client';

import React from 'react';
import { LedgerItem } from './types';
import { FinanceLedgerFilter } from './FinanceLedgerFilter';
import { FinanceLedgerTable } from './FinanceLedgerTable';
import { FinanceLedgerCharts } from './FinanceLedgerCharts';

interface Props {
  ledgerList: LedgerItem[];
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: 'all' | 'income' | 'expense';
  onTypeFilterChange: (v: 'all' | 'income' | 'expense') => void;
  catFilter: string;
  onCatFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  collectedCash: number;
}

export function FinanceLedgerTab(props: Props) {
  return (
    <div className="space-y-4">
      <FinanceLedgerCharts ledgerList={props.ledgerList} />
      <FinanceLedgerFilter
        search={props.search}
        onSearchChange={props.onSearchChange}
        typeFilter={props.typeFilter}
        onTypeFilterChange={props.onTypeFilterChange}
        catFilter={props.catFilter}
        onCatFilterChange={props.onCatFilterChange}
        statusFilter={props.statusFilter}
        onStatusFilterChange={props.onStatusFilterChange}
      />
      <FinanceLedgerTable
        ledgerList={props.ledgerList}
        collectedCash={props.collectedCash}
      />
    </div>
  );
}
