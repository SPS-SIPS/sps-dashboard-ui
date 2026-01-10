// app/dashboard/FinancialAnalyticsDashboard.jsx
"use client";

import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import DashboardCard from '../component/Dashboard/DashboardCard/DashboardCard';
import {
  FiDollarSign,
  FiMessageSquare,
  FiTrendingUp,
  FiAlertCircle,
  FiRepeat,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiHome,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiShield,
  FiDatabase,
  FiServer,
  FiLock,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import {
  MdBusiness,
  MdTrendingDown
} from 'react-icons/md';
import Link from 'next/link';
import styles from '../styles/FinancialAnalyticsDashboard.module.css';

const FinancialAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('today');

  // ========== DATA FROM TRANSACTIONS.PDF ==========
  const transactionTypeData = [
    { name: 'Deposit', count: 6100, totalAmount: 8900000 },
    { name: 'Withdrawal', count: 3200, totalAmount: 3400000 },
    { name: 'ReadyForReturn', count: 700, totalAmount: 420000 },
    { name: 'ReturnWithdrawal', count: 450, totalAmount: 280000 }
  ];

  const issuerActivityData = [
    { issuer: 'BANK_A', debtorTransactions: 3200, debtorAmount: 4500000, creditorTransactions: 3200, creditorAmount: 4500000 },
    { issuer: 'BANK_B', debtorTransactions: 2900, debtorAmount: 3800000, creditorTransactions: 2900, creditorAmount: 3800000 }
  ];

  const cashFlowData = [
    { category: 'Inbound', transactions: 6100, amount: 8900000 },
    { category: 'Outbound', transactions: 3200, amount: 3400000 }
  ];

  const topPartiesData = [
    { name: 'Company A', type: 'Debtor', transactions: 120, amount: 950000 },
    { name: 'Supplier X', type: 'Creditor', transactions: 140, amount: 1100000 },
    { name: 'Company B', type: 'Debtor', transactions: 95, amount: 780000 },
    { name: 'Supplier Y', type: 'Creditor', transactions: 110, amount: 920000 }
  ];

  const returnMonitoringData = [
    { type: 'ReadyForReturn', count: 650 },
    { type: 'ReturnWithdrawal', count: 530 }
  ];

  // ========== DATA FROM ISO_MESSAGE.PDF ==========
  const messageTypeData = [
    { name: 'TransactionRequest', count: 5400, type: 'request' },
    { name: 'TransactionResponse', count: 5600, type: 'response' },
    { name: 'StatusRequest', count: 1800, type: 'request' },
    { name: 'StatusResponse', count: 1900, type: 'response' },
    { name: 'ReturnRequest', count: 900, type: 'request' },
    { name: 'ReturnResponse', count: 800, type: 'response' }
  ];

  const statusDistributionData = [
    { status: 'Success', count: 15200 },
    { status: 'Failed', count: 2100 },
    { status: 'Pending', count: 1120 },
    { status: 'ReadyForReturn', count: 980 }
  ];

  const failureAnalysisData = [
    { reason: 'Insufficient Funds', count: 620 },
    { reason: 'Invalid Account', count: 480 },
    { reason: 'Timeout', count: 310 }
  ];

  const messageDefinitionData = [
    { msgDefIdr: 'pacs.008.001.08', count: 9800 },
    { msgDefIdr: 'pacs.002.001.10', count: 4600 }
  ];

  // ========== CORRELATION DATA ==========
  const correlationData = {
    matchedPairs: 8800,
    unmatchedRequests: 320,
    lateResponses: 210,
    successRate: 96.0
  };

  const returnsIntelligenceData = {
    readyForReturn: 980,
    returnRequests: 900,
    returnResponses: 800,
    returnSuccessRate: 88.9
  };

  // ========== CALCULATED METRICS ==========
  const totalTransactions = transactionTypeData.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = transactionTypeData.reduce((sum, item) => sum + item.totalAmount, 0);
  const netCashFlow = 5500000;
  const totalMessages = messageTypeData.reduce((sum, item) => sum + item.count, 0);
  const returnRate = 9.4;

  // Calculate percentages for display
  const calculatePercentage = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1);
  };

  // ========== METRICS CARDS ==========
  const MetricsCards = () => (
    <div className={styles.metricsGrid}>
      <DashboardCard
        title="Total Transactions"
        value={totalTransactions.toLocaleString()}
        description={`$${(totalAmount / 1000000).toFixed(1)}M+ value`}
        icon={<FiDollarSign />}
        colorVar="--color-primary-light"
      />
      
      <DashboardCard
        title="ISO Messages"
        value={totalMessages.toLocaleString()}
        description={`${correlationData.successRate}% success rate`}
        icon={<FiMessageSquare />}
        colorVar="--color-success-background"
      />
      
      <DashboardCard
        title="Net Cash Flow"
        value={`+$${(netCashFlow / 1000000).toFixed(1)}M`}
        description="Positive balance"
        icon={<FiTrendingUp />}
        colorVar="var(--color-success-background)"
        isRawColor
      />
      
      <DashboardCard
        title="Return Rate"
        value={`${returnRate}%`}
        description="Needs attention"
        icon={<FiAlertCircle />}
        colorVar="var(--color-error-background)"
        isRawColor
      />
    </div>
  );

  // ========== CHARTS ==========
  const TransactionDistributionChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiPieChart />
          <h3>Transaction Type Distribution</h3>
        </div>
        <select 
          className={styles.timeSelect}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
  <Pie
    data={transactionTypeData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={(props: any) => {
      const name = props.name || props.payload?.name || '';
      const percent = props.percent || 0;
      return `${name} (${(percent * 100).toFixed(1)}%)`;
    }}
    outerRadius={100}
    innerRadius={40}
    fill="#8884d8"
    dataKey="count"
  >
    {transactionTypeData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={
        entry.name === 'Deposit' ? '#10B981' :
        entry.name === 'Withdrawal' ? '#3B82F6' :
        entry.name === 'ReadyForReturn' ? '#F59E0B' :
        '#EF4444'
      } />
    ))}
  </Pie>
  <Tooltip 
    formatter={(value: any, name?: string, props?: any) => {
      if (props?.payload?.totalAmount) {
        return [`${value} transactions ($${(props.payload.totalAmount / 1000000).toFixed(1)}M)`, props.payload.name];
      }
      return [value, name || 'Count'];
    }}
  />
  <Legend />
</PieChart>
      </ResponsiveContainer>
    </div>
  );

  const CashFlowChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiBarChart2 />
          <h3>Cash Flow Overview</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={cashFlowData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="category" stroke="#6b7280" />
          <YAxis yAxisId="left" stroke="#6b7280" />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
          <Tooltip 
            formatter={(value: any, name?: string) => {
              if (name === 'amount') return [`$${Number(value).toLocaleString()}`, 'Amount'];
              return [value, 'Transactions'];
            }}
          />
          <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="amount" name="Amount ($)" stroke="#10B981" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className={styles.netFlowBadge}>
        <FiTrendingUp />
        <span>Net Flow: +${netCashFlow.toLocaleString()}</span>
      </div>
    </div>
  );

  const MessageTypeChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiMessageSquare />
          <h3>ISO Message Type Breakdown</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={messageTypeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Bar 
            dataKey="count" 
            name="Message Count"
            fill="#8B5CF6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const StatusDistributionChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiActivity />
          <h3>Message Status Distribution</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statusDistributionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="status" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Bar dataKey="count" name="Message Count" radius={[4, 4, 0, 0]}>
            {statusDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                entry.status === 'Success' ? '#10B981' :
                entry.status === 'Failed' ? '#EF4444' :
                entry.status === 'Pending' ? '#F59E0B' :
                '#8B5CF6'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const IssuerComparisonChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <MdBusiness />
          <h3>Issuer Activity Comparison</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={issuerActivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="issuer" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            formatter={(value: any, name?: string) => {
              if (name && (name.includes('Amount') || name.includes('amount'))) {
                return [`$${Number(value).toLocaleString()}`, 'Amount'];
              }
              return [value, 'Transactions'];
            }}
          />
          <Legend />
          <Bar dataKey="debtorTransactions" name="Debtor Transactions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="creditorTransactions" name="Creditor Transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const FailureAnalysisChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiXCircle />
          <h3>Failure Analysis</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={failureAnalysisData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis type="category" dataKey="reason" stroke="#6b7280" width={120} />
          <Tooltip />
          <Bar dataKey="count" name="Failure Count" fill="#EF4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );


  const TopPartiesChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiUsers />
          <h3>Top Parties Analysis</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topPartiesData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar
            name="Transaction Count"
            dataKey="transactions"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
          <Radar
            name="Amount ($)"
            dataKey="amount"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
          />
          <Legend />
          <Tooltip 
            formatter={(value: any, name?: string) => {
              if (name === 'amount') return [`$${Number(value).toLocaleString()}`, 'Amount'];
              return [value, 'Transactions'];
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  const ReturnMonitoringChart = () => (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>
          <FiRepeat />
          <h3>Return & Exception Monitoring</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={returnMonitoringData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="type" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#EF4444" 
            fill="#EF4444" 
            fillOpacity={0.3}
            name="Return Count"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className={styles.returnRateBadge}>
        <FiAlertCircle />
        <span>Overall Return Rate: {returnRate}%</span>
      </div>
    </div>
  );

  // ========== ALERTS & INSIGHTS ==========
  const AlertsSection = () => (
    <div className={styles.alertsCard}>
      <div className={styles.chartHeader}>
        <h3>Smart Insights</h3>
        <span className={styles.alertsBadge}>3 Active</span>
      </div>
      <div className={styles.alertsList}>
        <div className={`${styles.alertItem} ${styles.alertCritical}`}>
          <div className={styles.alertIcon}>
            <FiAlertCircle />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>High Failure Rate</div>
            <div className={styles.alertDescription}>High failure rate detected for BIC BANKDEFF</div>
          </div>
        </div>
        
        <div className={`${styles.alertItem} ${styles.alertWarning}`}>
          <div className={styles.alertIcon}>
            <FiClock />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Return Requests Increased</div>
            <div className={styles.alertDescription}>Return requests increased by 14% this period</div>
          </div>
        </div>
        
        <div className={`${styles.alertItem} ${styles.alertInfo}`}>
          <div className={styles.alertIcon}>
            <FiTrendingUp />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Transaction Volume High</div>
            <div className={styles.alertDescription}>Deposits represent 58% of total transaction volume</div>
          </div>
        </div>

        <div className={`${styles.alertItem} ${styles.alertSuccess}`}>
          <div className={styles.alertIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>High Success Rate</div>
            <div className={styles.alertDescription}>TransactionResponse messages have a 96% success rate</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== QUICK ACTIONS ==========
  const QuickActions = () => (
    <div className={styles.quickActions}>
      <div className={styles.chartHeader}>
        <h3>Quick Actions</h3>
        <FiFilter />
      </div>
      <div className={styles.actionsGrid}>
        <Link href="/transactions/analytics" className={styles.actionCard}>
          <FiDollarSign />
          <span>Transaction Analytics</span>
        </Link>
        
        <Link href="/iso-messages/analytics" className={styles.actionCard}>
          <FiMessageSquare />
          <span>Message Analytics</span>
        </Link>
        
        <Link href="/reports/financial" className={styles.actionCard}>
          <FiBarChart2 />
          <span>Generate Report</span>
        </Link>
        
        <Link href="/analytics/export" className={styles.actionCard}>
          <FiDownload />
          <span>Export Data</span>
        </Link>
        
        <Link href="/monitoring/alerts" className={styles.actionCard}>
          <FiAlertCircle />
          <span>Configure Alerts</span>
        </Link>
        
        <Link href="/dashboard/settings" className={styles.actionCard}>
          <FiServer />
          <span>Dashboard Settings</span>
        </Link>
      </div>
    </div>
  );

  // ========== RENDER CONTENT BASED ON TAB ==========
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <MetricsCards />
            
            <div className={styles.chartRow}>
              <TransactionDistributionChart />
              <CashFlowChart />
            </div>
            
            <div className={styles.chartRow}>
              <MessageTypeChart />
              <StatusDistributionChart />
            </div>
            
            <div className={styles.chartRow}>
              <IssuerComparisonChart />
              <TopPartiesChart />
            </div>
            
            <div className={styles.chartRow}>
              <FailureAnalysisChart />
              <ReturnMonitoringChart />
            </div>
            
            <AlertsSection />
            <QuickActions />
          </>
        );
      
      case 'transactions':
        return (
          <div className={styles.tabContentFull}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>Transaction Analytics</h3>
              <button className={styles.exportButton}>
                <FiDownload /> Export Data
              </button>
            </div>
            
            <div className={styles.chartRow}>
              <TransactionDistributionChart />
              <CashFlowChart />
            </div>
            
            <div className={styles.chartRow}>
              <IssuerComparisonChart />
              <TopPartiesChart />
            </div>
            
            <div className={styles.statsGrid}>
              {transactionTypeData.map((item, index) => {
                const percentage = calculatePercentage(item.count, totalTransactions);
                return (
                  <div key={index} className={styles.statItem}>
                    <div className={styles.statHeader}>
                      <span className={styles.statName}>{item.name}</span>
                      <span className={styles.statPercentage}>{percentage}%</span>
                    </div>
                    <div className={styles.statValue}>{item.count.toLocaleString()} transactions</div>
                    <div className={styles.statAmount}>${(item.totalAmount / 1000000).toFixed(1)}M</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div className={styles.tabContentFull}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>ISO Message Analytics</h3>
              <button className={styles.exportButton}>
                <FiDownload /> Export Data
              </button>
            </div>
            
            <div className={styles.chartRow}>
              <MessageTypeChart />
              <StatusDistributionChart />
            </div>
            
            <div className={styles.chartRow}>
              <FailureAnalysisChart />
            </div>
            
           
            
            <div className={styles.returnsSection}>
              <h4>Returns Intelligence</h4>
              <div className={styles.returnsGrid}>
                <div className={styles.returnMetric}>
                  <div className={styles.returnValue}>{returnsIntelligenceData.readyForReturn}</div>
                  <div className={styles.returnLabel}>Ready for Return</div>
                </div>
                <div className={styles.returnMetric}>
                  <div className={styles.returnValue}>{returnsIntelligenceData.returnRequests}</div>
                  <div className={styles.returnLabel}>Return Requests</div>
                </div>
                <div className={styles.returnMetric}>
                  <div className={styles.returnValue}>{returnsIntelligenceData.returnResponses}</div>
                  <div className={styles.returnLabel}>Return Responses</div>
                </div>
                <div className={styles.returnMetric}>
                  <div className={styles.returnValue} style={{ color: '#10B981' }}>
                    {returnsIntelligenceData.returnSuccessRate}%
                  </div>
                  <div className={styles.returnLabel}>Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        );
      
    
      default:
        return null;
    }
  };

  return (
    <div className={styles.analyticsContainer}>
      {/* Dashboard header with role indicator */}
      <header className={styles.analyticsHeader}>
        <div>
          <div className={styles.roleBadge}>
            <FiLock />
            <span>Restricted Access - Financial Analytics</span>
          </div>
          <h1 className={styles.analyticsTitle}>Financial Analytics Dashboard</h1>
          <p className={styles.analyticsSubtitle}>
            Advanced financial insights and transaction monitoring for authorized personnel only
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 />
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'transactions' ? styles.active : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <FiDollarSign />
          Transactions
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'messages' ? styles.active : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <FiMessageSquare />
          ISO Messages
        </button>
        
      </div>

      {/* Main Content */}
      <main className={styles.analyticsMain}>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default FinancialAnalyticsDashboard;