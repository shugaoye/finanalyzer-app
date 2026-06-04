export function createWidget(options) {
  return {
    render: (container) => {
      const { symbol, apiKey } = options.params;
      
      container.innerHTML = `
        <div style="padding: 16px; font-family: Arial, sans-serif;">
          <h3>Stock Widget</h3>
          <div style="margin: 16px 0;">
            <p><strong>Symbol:</strong> ${symbol}</p>
            <p><strong>API Key:</strong> ${apiKey ? 'Set' : 'Not set'}</p>
          </div>
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <p>This widget demonstrates parameter linking. The symbol and API key are linked to extension-level parameters.</p>
            <p>When you update the extension-level parameters, this widget will automatically receive the updated values.</p>
          </div>
        </div>
      `;
    },
    update: (data) => {
      console.log('Updating stock widget with data:', data);
    },
    destroy: () => {
      console.log('Destroying stock widget');
    }
  };
}