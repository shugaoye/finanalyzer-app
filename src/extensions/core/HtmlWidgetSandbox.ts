
/**
 * HTML widget sandbox options
 */
export interface HtmlWidgetSandboxOptions {
  allowScripts?: boolean;
  allowForms?: boolean;
  allowModals?: boolean;
  allowPopups?: boolean;
  allowSameOrigin?: boolean;
  csp?: {
    scriptSrc?: string[];
    connectSrc?: string[];
    imgSrc?: string[];
    styleSrc?: string[];
    fontSrc?: string[];
  };
  whitelistedDomains?: string[];
}

/**
 * HTML widget sandbox for secure JavaScript execution
 */
export class HtmlWidgetSandbox {
  private options: HtmlWidgetSandboxOptions;

  /**
   * Creates a new HTML widget sandbox
   * @param options Sandbox options
   */
  constructor(options: HtmlWidgetSandboxOptions = {}) {
    this.options = {
      allowScripts: true,
      allowForms: true,
      allowModals: false,
      allowPopups: false,
      allowSameOrigin: false,
      csp: {
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
      },
      whitelistedDomains: [],
      ...options,
    };
  }

  /**
   * Creates a sandboxed iframe for HTML widget
   * @param widgetId Widget ID
   * @param instanceId Widget instance ID
   * @returns Sandboxed iframe element
   */
  createSandbox(widgetId: string, instanceId: string): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    
    // Set sandbox attributes based on options
    const sandboxAttrs: string[] = [];
    if (this.options.allowSameOrigin) sandboxAttrs.push("allow-same-origin");
    if (this.options.allowScripts) sandboxAttrs.push("allow-scripts");
    if (this.options.allowForms) sandboxAttrs.push("allow-forms");
    if (this.options.allowModals) sandboxAttrs.push("allow-modals");
    if (this.options.allowPopups) sandboxAttrs.push("allow-popups");
    
    // For srcdoc iframes, we need at least allow-scripts to run the bridge script
    if (!sandboxAttrs.includes("allow-scripts")) {
      sandboxAttrs.push("allow-scripts");
    }
    
    iframe.sandbox = sandboxAttrs.join(" ");
    
    // Generate CSP header
    const cspDirectives = this.generateCSPDirectives();
    
    // Set unique origin for isolation
    iframe.srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${cspDirectives}">
  <title>HTML Widget Sandbox</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    .widget-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div class="widget-container" id="widget-content"></div>
  <script>
    // PostMessage bridge for widget-host communication
    window.addEventListener('message', function(event) {
      // Accept messages from parent window (srcdoc iframe has null origin)
      // Verify the message structure instead of origin
      const data = event.data;
      if (!data || typeof data.type !== 'string') return;
      
      if (data.type === 'widgetContent' && typeof data.content === 'string') {
        const container = document.getElementById('widget-content');
        if (container) {
          container.innerHTML = data.content;
        }
      }
    });
    
    // Send ready message to host
    window.parent.postMessage({ type: 'widgetReady', widgetId: '${widgetId}', instanceId: '${instanceId}' }, '*');
  </script>
</body>
</html>`;
    
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    
    return iframe;
  }

  /**
   * Injects content into the sandboxed iframe
   * @param iframe Iframe element
   * @param content HTML content to inject
   */
  injectContent(iframe: HTMLIFrameElement, content: string): void {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'widgetContent', content }, '*');
    }
  }

  /**
   * Sets up PostMessage communication between widget and host
   * @param iframe Iframe element
   * @param widgetId Widget ID
   * @param instanceId Widget instance ID
   * @param onMessage Callback for incoming messages
   * @returns Cleanup function
   */
  setupCommunication(
    _iframe: HTMLIFrameElement,
    widgetId: string,
    instanceId: string,
    onMessage: (message: any) => void
  ): () => void {
    const messageHandler = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.widgetId === widgetId && data.instanceId === instanceId) {
        onMessage(data);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }

  /**
   * Cleans up the sandbox
   * @param iframe Iframe element
   */
  cleanup(iframe: HTMLIFrameElement): void {
    // Remove iframe from DOM
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }

  /**
   * Generates CSP directives for the sandbox
   * @returns CSP directives string
   */
  private generateCSPDirectives(): string {
    const csp = this.options.csp;
    const directives = [];
    
    if (csp?.scriptSrc) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`);
    }
    
    if (csp?.connectSrc) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`);
    }
    
    if (csp?.imgSrc) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`);
    }
    
    if (csp?.styleSrc) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`);
    }
    
    if (csp?.fontSrc) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`);
    }
    
    // Add security directives (order matters - specific directives override default)
    directives.push('object-src \'none\'');
    directives.push('frame-src \'none\'');
    directives.push('base-uri \'none\'');
    
    // Only restrict form-action if forms are not allowed
    if (!this.options.allowForms) {
      directives.push('form-action \'none\'');
    }
    
    return directives.join('; ');
  }

  /**
   * Validates external domains against whitelist
   * @param domain Domain to validate
   * @returns True if domain is whitelisted
   */
  isDomainWhitelisted(domain: string): boolean {
    if (this.options.whitelistedDomains?.length === 0) {
      return false;
    }
    
    return this.options.whitelistedDomains?.some(whitelistedDomain => {
      return domain.startsWith(whitelistedDomain);
    }) || false;
  }
}

/**
 * Creates a singleton instance of the HTML widget sandbox
 */
let htmlWidgetSandboxInstance: HtmlWidgetSandbox | null = null;

export function getHtmlWidgetSandbox(
  options?: HtmlWidgetSandboxOptions
): HtmlWidgetSandbox {
  if (!htmlWidgetSandboxInstance) {
    htmlWidgetSandboxInstance = new HtmlWidgetSandbox(options);
  }
  return htmlWidgetSandboxInstance;
}
