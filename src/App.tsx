import { useState } from 'react';
import { Button, Input, Label, Tag } from '@openbb/ui';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';

function App() {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Finanalyzer</h1>
            <p className="mt-2 text-slate-600">{t('home.subtitle')}</p>
          </div>
          <LanguageSelector />
        </header>

        {/* Main Content */}
        <main className="mb-8">
          {/* Welcome Section */}
          <div className="p-6 rounded-lg border border-slate-200 bg-white mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">{t('home.welcome')}</h2>
              <p className="text-slate-600 mb-4">
                一个强大的投资组合管理工具，帮助您分析和优化投资策略
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" onClick={() => setCount(count + 1)}>
                增加计数: {count}
              </Button>
              <Button variant="outlined" size="lg">
                {t('common.learnMore', { defaultValue: '了解更多' })}
              </Button>
              <Button variant="secondary" size="lg">
                {t('common.contactUs', { defaultValue: '联系我们' })}
              </Button>
            </div>
          </div>

          {/* Feature Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <div className="p-6 rounded-lg border border-slate-200 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{t('features.portfolioAnalysis', { defaultValue: '投资组合分析' })}</h3>
                <p className="text-slate-600 mb-4">{t('features.realTimeMonitoring', { defaultValue: '实时监控您的投资表现' })}</p>
              </div>
              <p className="text-slate-900 mb-4">{t('features.portfolioAnalysisDesc', { defaultValue: '使用我们的分析工具，跟踪投资组合的表现，识别趋势和机会。' })}</p>
              <Button variant="outlined" size="sm">
                {t('common.viewDetails', { defaultValue: '查看详情' })}
              </Button>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{t('features.marketData', { defaultValue: '市场数据' })}</h3>
                <p className="text-slate-600 mb-4">{t('features.latestMarketInfo', { defaultValue: '获取最新的市场信息' })}</p>
              </div>
              <p className="text-slate-900 mb-4">{t('features.marketDataDesc', { defaultValue: '访问实时市场数据，做出明智的投资决策。' })}</p>
              <Button variant="outlined" size="sm">
                {t('common.browseData', { defaultValue: '浏览数据' })}
              </Button>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{t('features.riskAssessment', { defaultValue: '风险评估' })}</h3>
                <p className="text-slate-600 mb-4">{t('features.assessManageRisk', { defaultValue: '评估和管理投资风险' })}</p>
              </div>
              <p className="text-slate-900 mb-4">{t('features.riskAssessmentDesc', { defaultValue: '使用我们的风险评估工具，确保您的投资符合您的风险承受能力。' })}</p>
              <Button variant="outlined" size="sm">
                {t('common.startAssessment', { defaultValue: '开始评估' })}
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-6 rounded-lg border border-slate-200 bg-white mt-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">{t('common.contactUs', { defaultValue: '联系我们' })}</h2>
              <p className="text-slate-600 mb-4">{t('common.contactMessage', { defaultValue: '如有任何问题，请随时联系我们' })}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t('common.emailPlaceholder')} 
                  value={email}
                  onChange={(value) => setEmail(value as string)}
                />
              </div>
              <Button variant="primary" type="submit">
                {t('common.sendMessage', { defaultValue: '发送消息' })}
              </Button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-6 rounded-lg border border-slate-200 bg-white mt-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('common.popularTags', { defaultValue: '热门标签' })}</h2>
            <div className="flex flex-wrap gap-2">
              <Tag color="success">{t('tags.portfolio', { defaultValue: '投资组合' })}</Tag>
              <Tag color="warning">{t('tags.marketAnalysis', { defaultValue: '市场分析' })}</Tag>
              <Tag color="purple">{t('tags.riskManagement', { defaultValue: '风险管理' })}</Tag>
              <Tag color="light-blue">{t('tags.assetAllocation', { defaultValue: '资产配置' })}</Tag>
              <Tag color="dark-blue">{t('tags.financialPlanning', { defaultValue: '财务规划' })}</Tag>
              <Tag color="ruby">{t('tags.stockAnalysis', { defaultValue: '股票分析' })}</Tag>
              <Tag color="yellow">{t('tags.bondInvestment', { defaultValue: '债券投资' })}</Tag>
              <Tag color="grey">{t('tags.marketTrends', { defaultValue: '市场趋势' })}</Tag>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-600">© 2026 Finanalyzer. {t('common.allRightsReserved', { defaultValue: '保留所有权利。' })}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outlined" size="sm">
                {t('common.privacyPolicy', { defaultValue: '隐私政策' })}
              </Button>
              <Button variant="outlined" size="sm">
                {t('common.termsOfService', { defaultValue: '使用条款' })}
              </Button>
              <Button variant="outlined" size="sm">
                {t('common.contactUs', { defaultValue: '联系我们' })}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App
