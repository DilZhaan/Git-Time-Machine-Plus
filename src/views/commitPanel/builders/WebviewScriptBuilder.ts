/**
 * Builder for webview client-side scripts
 * Follows Single Responsibility Principle - assembles client-side logic
 */

import {
  StateManagerScript,
  CommitRendererScript,
  ViewManagerScript,
  EventHandlerScript,
  MessageHandlerScript
} from './clientScripts';

export class WebviewScriptBuilder {
  /**
   * Build complete client-side script
   */
  public buildScript(nonce: string): string {
    return `
      <script nonce="${nonce}">
        (function() {
          // Acquire VS Code API
          const vscode = acquireVsCodeApi();
          console.log('Git Time Machine Plus webview loaded');

          // Wait for VSCode Design System to be ready
          async function waitForDesignSystem() {
            console.log('Waiting for VSCode Design System...');
            try {
              // Wait for provideVSCodeDesignSystem to be available
              let attempts = 0;
              while (!window.provideVSCodeDesignSystem && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
              }
              
              if (window.provideVSCodeDesignSystem) {
                // Register all components
                window.provideVSCodeDesignSystem().register(
                  window.vsCodeButton(),
                  window.vsCodeTextField(),
                  window.vsCodeTextArea(),
                  window.vsCodeCheckbox(),
                  window.vsCodeProgressRing()
                );
                console.log('✅ VSCode Design System registered');
              } else {
                console.error('❌ VSCode Design System not found after waiting');
              }
            } catch (error) {
              console.error('❌ Error initializing design system:', error);
            }
          }

          ${StateManagerScript.generate()}
          ${CommitRendererScript.generate()}
          ${ViewManagerScript.generate()}
          ${EventHandlerScript.generate()}
          ${MessageHandlerScript.generate()}

          /**
           * Application - Main application controller
           */
          class Application {
            constructor() {
              this.state = new StateManager();
              this.renderer = new CommitRenderer(this.state);
              this.viewManager = new ViewManager(this.state);
              this.eventHandler = new EventHandler(this.state, this.renderer, this.viewManager);
              this.messageHandler = new MessageHandler(this.state, this.renderer, this.viewManager);
            }

            async initialize() {
              console.log('Initializing webview application...');
              await waitForDesignSystem();
              await this.eventHandler.initializeEventListeners();
              this.messageHandler.initializeMessageListener();
              console.log('✅ Application initialized');
            }
          }

          // Global functions for inline event handlers (needed for onclick attributes)
          window.editCommit = function(hash) {
            vscode.postMessage({ type: 'editCommit', hash });
          };

          // Initialize application
          const app = new Application();
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => app.initialize());
          } else {
            app.initialize();
          }
        })();
      </script>
    `;
  }
}

