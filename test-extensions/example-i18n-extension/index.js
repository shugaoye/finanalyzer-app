// Example i18n extension entry point

function ExampleI18nWidget() {
  return {
    render: () => {
      return `
        <div style="padding: 20px; background: #f0f0f0; border-radius: 8px;">
          <h3>Example I18n Widget</h3>
          <p>This is a test widget with i18n support.</p>
        </div>
      `;
    },
    update: () => {
      // No update logic needed for this example
    },
    destroy: () => {
      // Cleanup if needed
    }
  };
}

// Register the widget
if (typeof window !== 'undefined' && window.registerWidget) {
  window.registerWidget('example-i18n-widget', ExampleI18nWidget);
}

export default ExampleI18nWidget;