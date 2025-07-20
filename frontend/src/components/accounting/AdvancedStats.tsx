import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { Card } from '../common/Card';

interface AccountingEntry {
  id: string;
  entry_type: 'expense' | 'revenue';
  category: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
}

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  monthly_data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  expense_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  revenue_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

interface AdvancedStatsProps {
  entries: AccountingEntry[];
  summary: FinancialSummary;
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ entries, summary }) => {
  // Calculs avancés
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const previousMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return entryDate.getMonth() === prevMonth && entryDate.getFullYear() === prevYear;
  });

  const currentMonthRevenue = currentMonthEntries
    .filter(entry => entry.entry_type === 'revenue')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const currentMonthExpenses = currentMonthEntries
    .filter(entry => entry.entry_type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const previousMonthRevenue = previousMonthEntries
    .filter(entry => entry.entry_type === 'revenue')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const previousMonthExpenses = previousMonthEntries
    .filter(entry => entry.entry_type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  const expenseGrowth = previousMonthExpenses > 0 
    ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
    : 0;

  const averageTransactionAmount = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.amount, 0) / entries.length 
    : 0;

  const profitMargin = summary.total_revenue > 0 
    ? (summary.net_profit / summary.total_revenue) * 100 
    : 0;

  const topExpenseCategory = summary.expense_by_category.length > 0 
    ? summary.expense_by_category[0] 
    : null;

  const topRevenueCategory = summary.revenue_by_category.length > 0 
    ? summary.revenue_by_category[0] 
    : null;

  const statsCards = [
    {
      title: 'Marge bénéficiaire',
      value: `${profitMargin.toFixed(1)}%`,
      icon: CalculatorIcon,
      color: profitMargin >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: profitMargin >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
      description: 'Bénéfice / Revenus totaux'
    },
    {
      title: 'Croissance revenus',
      value: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      icon: revenueGrowth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
      color: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: revenueGrowth >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
      description: 'vs mois précédent'
    },
    {
      title: 'Évolution dépenses',
      value: `${expenseGrowth >= 0 ? '+' : ''}${expenseGrowth.toFixed(1)}%`,
      icon: expenseGrowth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
      color: expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600',
      bgColor: expenseGrowth >= 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20',
      description: 'vs mois précédent'
    },
    {
      title: 'Transaction moyenne',
      value: `${averageTransactionAmount.toFixed(2)} DT`,
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Montant moyen par écriture'
    },
    {
      title: 'Revenus ce mois',
      value: `${currentMonthRevenue.toFixed(2)} DT`,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: `${currentMonthEntries.filter(e => e.entry_type === 'revenue').length} transactions`
    },
    {
      title: 'Dépenses ce mois',
      value: `${currentMonthExpenses.toFixed(2)} DT`,
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: `${currentMonthEntries.filter(e => e.entry_type === 'expense').length} transactions`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top catégories dépenses */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingDownIcon className="h-5 w-5 mr-2 text-red-600" />
              Top catégories de dépenses
            </h3>
            <div className="space-y-3">
              {summary.expense_by_category.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {category.amount.toFixed(2)} DT
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top catégories revenus */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
              Top catégories de revenus
            </h3>
            <div className="space-y-3">
              {summary.revenue_by_category.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-emerald-500' :
                      index === 2 ? 'bg-teal-500' :
                      index === 3 ? 'bg-cyan-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {category.amount.toFixed(2)} DT
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedStats;
