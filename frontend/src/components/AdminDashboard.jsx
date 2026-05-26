import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { fmt } from '../utils/formatter';

const AdminDashboard = ({
  paymentVerifications,
  onMarkPaid,
  onReject,
  onClose
}) => {
  const { t, lang, dir } = useI18n();
  const [filter, setFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'badge badge-pending';
      case 'UNDER_REVIEW':
        return 'badge badge-review';
      case 'WAITING_CONFIRMATION':
        return 'badge badge-waiting';
      case 'PAID':
        return 'badge badge-paid';
      case 'REJECTED':
        return 'badge badge-rejected';
      default:
        return 'badge';
    }
  };

  const getFraudScoreClass = (score) => {
    if (score > 60) return 'bg-red-100 text-red-600 dark:bg-red-900/30';
    if (score > 30) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30';
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30';
  };

  const filteredVerifications = paymentVerifications.filter(
    (v) => filter === 'all' || v.verificationStatus === filter
  );

  return (
    <main className="flex-1 py-12 px-6 md:px-12 max-w-6xl mx-auto font-sans" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={onClose}
            className="text-xs font-serif font-bold text-clay-600 dark:text-gold-400 hover:opacity-85 flex items-center gap-1.5 mb-2"
          >
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            {t('backShop')}
          </button>
          <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-earth-900 dark:text-cream-100">
            {t('revTitle')}
          </h2>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card overflow-hidden bg-cream-50 dark:bg-earth-800 border border-warm-200 dark:border-earth-700 rounded-2xl shadow-xl">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-warm-200 dark:border-earth-700 flex justify-between items-center bg-cream-50 dark:bg-earth-800/50">
          <h3 className="font-bold text-earth-900 dark:text-cream-100">
            {t('recentTransactions')}
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-earth-900 border border-warm-300 dark:border-earth-600 rounded-lg px-3 py-1.5 text-sm text-earth-700 dark:text-cream-200 outline-none cursor-pointer"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="UNDER_REVIEW">{t('step_UNDER_REVIEW')}</option>
            <option value="WAITING_CONFIRMATION">{t('step_WAITING_CONFIRMATION')}</option>
            <option value="PAID">{t('step_PAID')}</option>
            <option value="REJECTED">{t('payRejected')}</option>
          </select>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ direction: dir }}>
            <thead className="bg-warm-50 dark:bg-earth-800/30 text-earth-500 dark:text-cream-400 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">{t('orderIdCol')}</th>
                <th className="px-6 py-4">{t('methodCol')}</th>
                <th className="px-6 py-4">{t('amountCol')}</th>
                <th className="px-6 py-4">{t('aiFraudScoreCol')}</th>
                <th className="px-6 py-4">{t('statusCol')}</th>
                <th className="px-6 py-4">{t('dateCol')}</th>
                <th className="px-6 py-4 text-right">{t('actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200 dark:divide-earth-700">
              {filteredVerifications.slice().reverse().map((v) => (
                <React.Fragment key={v.id}>
                  <tr className="hover:bg-cream-50 dark:hover:bg-earth-800/30 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono font-medium text-earth-900 dark:text-cream-100">
                      #{v.orderId}
                    </td>
                    <td className="px-6 py-4 text-earth-600 dark:text-cream-300 capitalize">
                      {v.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-bold text-clay-600 dark:text-gold-400">
                      {fmt(v.extractedData?.amount || v.orderAmount, lang)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${getFraudScoreClass(v.fraudScore)}`}>
                        {v.fraudScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadgeClass(v.verificationStatus)}>
                        {t('step_' + v.verificationStatus) || v.verificationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-earth-500 dark:text-cream-400 text-xs">
                      {new Date(v.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 space-x-reverse">
                      <button
                        onClick={() => setExpandedRow(expandedRow === v.id ? null : v.id)}
                        className="px-3 py-1.5 bg-earth-100 dark:bg-earth-700 hover:bg-earth-200 dark:hover:bg-earth-600 text-earth-700 dark:text-cream-200 rounded-lg font-medium transition-colors text-xs"
                      >
                        {t('detailsBtn')}
                      </button>
                      {(v.verificationStatus === 'WAITING_CONFIRMATION' || v.verificationStatus === 'UNDER_REVIEW') && (
                        <>
                          <button
                            onClick={() => onMarkPaid(v.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-xs shadow-sm shadow-emerald-500/20"
                          >
                            <i className="fa-solid fa-check mr-1 ml-1"></i> {t('markPaidBtn')}
                          </button>
                          <button
                            onClick={() => onReject(v.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-xs shadow-sm shadow-red-500/20"
                          >
                            <i className="fa-solid fa-xmark mr-1 ml-1"></i> {t('rejectBtn')}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Detail Panel */}
                  {expandedRow === v.id && (
                    <tr className="bg-cream-50 dark:bg-earth-900/30 border-b border-warm-200 dark:border-earth-700">
                      <td colspan="7" className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-bold text-earth-900 dark:text-cream-100 mb-3 border-b border-warm-200 dark:border-earth-700 pb-2">
                              {t('ocrExtractedData')}
                            </h4>
                            <div className="space-y-2 text-xs">
                              {Object.entries(v.extractedData || {}).map(([key, val]) => {
                                if (val && key !== 'confidence') {
                                  return (
                                    <div className="flex justify-between" key={key}>
                                      <span className="text-earth-500 dark:text-cream-400 capitalize">
                                        {t('ext_' + key) || key}
                                      </span>
                                      <span className="font-medium text-earth-900 dark:text-cream-100">
                                        {key === 'amount' ? fmt(val, lang) : val}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>

                            <h4 className="font-bold text-earth-900 dark:text-cream-100 mt-6 mb-3 border-b border-warm-200 dark:border-earth-700 pb-2">
                              {t('valChecklist')}
                            </h4>
                            <div className="space-y-1.5 text-xs">
                              {Object.entries(v.validation || {}).map(([key, passed]) => {
                                if (key !== 'rejectReason' && key !== 'autoReject') {
                                  return (
                                    <div className="flex justify-between" key={key}>
                                      <span className="text-earth-500 dark:text-cream-400 capitalize">
                                        {t('val_' + key) || key}
                                      </span>
                                      <span
                                        className={
                                          passed ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'
                                        }
                                      >
                                        {passed ? 'PASS' : 'FAIL'}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                              {v.validation?.rejectReason && (
                                <div className="mt-2 text-red-600 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                  {t('reason')}: <span>{v.validation.rejectReason}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-earth-900 dark:text-cream-100 mb-3 border-b border-warm-200 dark:border-earth-700 pb-2">
                              {t('uploadedReceipt')}
                            </h4>
                            {v.uploadedImage ? (
                              <a
                                href={v.uploadedImage}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg overflow-hidden border border-warm-200 dark:border-earth-700 hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={v.uploadedImage}
                                  className="w-full max-h-64 object-contain bg-black"
                                  alt="Receipt"
                                />
                              </a>
                            ) : (
                              <p className="text-xs text-earth-400">No Image Uploaded</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredVerifications.length === 0 && (
                <tr>
                  <td colspan="7" className="px-6 py-8 text-center text-earth-500 dark:text-cream-400">
                    {t('noVerifications')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
