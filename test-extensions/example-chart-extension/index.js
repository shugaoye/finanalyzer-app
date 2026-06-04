export function createWidget(options) {
  return {
    render: (container) => {
      const { symbol, period, showVolume } = options.params;
      
      container.innerHTML = `
        <div style="padding: 16px; font-family: Arial, sans-serif;">
          <h3>Line Chart Widget</h3>
          <div style="margin: 16px 0;">
            <p><strong>Symbol:</strong> ${symbol}</p>
            <p><strong>Period:</strong> ${period}</p>
            <p><strong>Show Volume:</strong> ${showVolume ? 'Yes' : 'No'}</p>
          </div>
          <div style="height: 300px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <p>Chart would display here for ${symbol} (${period})</p>
          </div>
        </div>
      `;
    },
    update: (data) => {
      console.log('Updating chart with data:', data);
    },
    destroy: () => {
      console.log('Destroying chart widget');
    }
  };
}