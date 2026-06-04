export function createWidget(options) {
  return {
    render: (container) => {
      const { symbol, apiKey } = options.params;
      
      container.innerHTML = `
        <div style="padding: 16px; font-family: Arial, sans-serif;">
          <h3>News Widget</h3>
          <div style="margin: 16px 0;">
            <p><strong>Symbol:</strong> ${symbol}</p>
            <p><strong>API Key:</strong> ${apiKey ? 'Set' : 'Not set'}</p>
          </div>
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <p>This widget also demonstrates parameter linking. The API key is linked to the same extension-level parameter as the Stock Widget.</p>
            <p>When you set the API key at the extension level, both widgets will receive the same value.</p>
          </div>
        </div>
      `;
    },
    update: (data) => {
      console.log('Updating news widget with data:', data);
    },
    destroy: () => {
      console.log('Destroying news widget');
    }
  };
}