
/**
 * ChurnGuardian - User behavior tracking SDK for churn prediction
 * v1.0.1
 */
(function (window) {
  const ChurnGuardian = function (config) {
    if (!config || !config.apiKey) {
      console.error('ChurnGuardian: API key is required');
      return;
    }

    // Configuration
    this.config = {
      apiKey: config.apiKey,
      endpoint: config.endpoint || 'https://szjgbkjztoqlqhjeaspu.supabase.co/functions/v1',
      trackClicks: config.trackClicks !== false,
      trackPageViews: config.trackPageViews !== false,
      trackForms: config.trackForms !== false,
      trackErrors: config.trackErrors !== false,
      identifyFromUrl: config.identifyFromUrl || false,
      userIdParam: config.userIdParam || 'uid',
      debug: config.debug || false,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000
    };

    // State
    this.state = {
      userId: config.userId || this._getUserIdFromStorage() || this._generateAnonymousId(),
      sessionId: this._generateSessionId(),
      startTime: new Date(),
      initialized: false,
      eventQueue: [],
      requestsInProgress: 0,
      errorCount: 0
    };

    // Initialize
    this._init();
  };

  ChurnGuardian.prototype = {
    /**
     * Initialize the tracker
     */
    _init: function () {
      if (this.state.initialized) return;

      try {
        // Save user ID to storage
        this._saveUserIdToStorage(this.state.userId);

        // Extract user ID from URL if configured
        if (this.config.identifyFromUrl) {
          const urlUserId = this._getUserIdFromUrl();
          if (urlUserId) {
            this.identify(urlUserId);
          }
        }

        // Set up event listeners
        if (this.config.trackPageViews) {
          this._trackPageView();
          
          // Track navigation events
          if (window.history && window.history.pushState) {
            const originalPushState = window.history.pushState;
            window.history.pushState = function (...args) {
              originalPushState.apply(this, args);
              this._trackPageView();
            }.bind(this);
            
            window.addEventListener('popstate', this._trackPageView.bind(this));
          }
        }

        if (this.config.trackClicks) {
          document.addEventListener('click', this._handleClick.bind(this));
        }

        if (this.config.trackForms) {
          document.addEventListener('submit', this._handleFormSubmit.bind(this));
        }

        if (this.config.trackErrors) {
          window.addEventListener('error', this._handleError.bind(this));
          window.addEventListener('unhandledrejection', this._handlePromiseRejection.bind(this));
        }

        // Track heartbeat for session duration
        this._setupHeartbeat();

        // Mark as initialized
        this.state.initialized = true;
        this._log('ChurnGuardian initialized');

        // Process any queued events
        this._processQueue();
      } catch (error) {
        console.error('ChurnGuardian: Error during initialization:', error);
      }
    },

    /**
     * Set up heartbeat to track session duration
     */
    _setupHeartbeat: function() {
      const HEARTBEAT_INTERVAL = 60000; // 1 minute
      
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.track('heartbeat', {
            session_duration: Math.floor((new Date() - this.state.startTime) / 1000)
          });
        }
      }, HEARTBEAT_INTERVAL);
    },

    /**
     * Identify a user
     * @param {string} userId - Unique user identifier
     * @param {object} traits - User traits/properties
     */
    identify: function (userId, traits = {}) {
      if (!userId) return;

      try {
        const previousId = this.state.userId !== userId ? this.state.userId : undefined;
        this.state.userId = userId;
        this._saveUserIdToStorage(userId);
        
        this.track('identify', {
          previous_id: previousId,
          traits: traits
        });
        
        this._log('User identified:', userId, traits);
        
        // Update all queued events with the new user ID
        this.state.eventQueue = this.state.eventQueue.map(event => {
          event.user_id = userId;
          return event;
        });
      } catch (error) {
        console.error('ChurnGuardian: Error during identify:', error);
      }
    },

    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {object} properties - Properties associated with the event
     */
    track: function (eventName, properties = {}) {
      if (!eventName) return;

      try {
        const event = {
          api_key: this.config.apiKey,
          user_id: this.state.userId,
          session_id: this.state.sessionId,
          event_type: eventName,
          page_url: window.location.href,
          element_info: {
            ...properties,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer || ''
          }
        };

        this._sendEvent(event);
        this._log('Event tracked:', eventName, properties);
      } catch (error) {
        console.error('ChurnGuardian: Error during track:', error);
      }
    },

    /**
     * Get the current user's churn prediction
     * @param {function} callback - Callback function to receive the prediction
     */
    getPrediction: function (callback) {
      if (!this.state.userId) {
        this._log('Cannot get prediction: No user ID');
        if (callback) callback(new Error('No user ID available'), null);
        return;
      }

      try {
        this.state.requestsInProgress++;
        
        fetch(`${this.config.endpoint}/predict-churn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: this.config.apiKey,
            user_id: this.state.userId
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this._log('Prediction received:', data);
          this.state.requestsInProgress--;
          if (callback) callback(null, data.prediction);
        })
        .catch(error => {
          this._log('Error getting prediction:', error);
          this.state.requestsInProgress--;
          this.state.errorCount++;
          if (callback) callback(error, null);
        });
      } catch (error) {
        this.state.requestsInProgress--;
        this.state.errorCount++;
        console.error('ChurnGuardian: Error during getPrediction:', error);
        if (callback) callback(error, null);
      }
    },

    /**
     * Reset the current session
     */
    resetSession: function () {
      this.state.sessionId = this._generateSessionId();
      this.state.startTime = new Date();
      this._log('Session reset:', this.state.sessionId);
    },

    /**
     * Track a page view event
     */
    _trackPageView: function () {
      this.track('page_view', {
        title: document.title,
        path: window.location.pathname,
        url: window.location.href
      });
    },

    /**
     * Handle click events
     * @param {Event} event - DOM click event
     */
    _handleClick: function (event) {
      try {
        const target = event.target.closest('a, button, input[type="button"], input[type="submit"]');
        if (!target) return;

        const properties = {
          element_type: target.tagName.toLowerCase(),
          element_id: target.id || undefined,
          element_class: target.className || undefined,
          element_text: target.innerText || target.value || undefined
        };

        if (target.tagName.toLowerCase() === 'a') {
          properties.href = target.href;
        }

        this.track('click', properties);
      } catch (error) {
        console.error('ChurnGuardian: Error handling click:', error);
      }
    },

    /**
     * Handle form submission events
     * @param {Event} event - Form submission event
     */
    _handleFormSubmit: function (event) {
      try {
        const form = event.target;
        if (!form || form.tagName.toLowerCase() !== 'form') return;

        this.track('form_submit', {
          form_id: form.id || undefined,
          form_name: form.name || undefined,
          form_action: form.action || undefined
        });
      } catch (error) {
        console.error('ChurnGuardian: Error handling form submit:', error);
      }
    },

    /**
     * Handle JavaScript errors
     * @param {ErrorEvent} event - Error event
     */
    _handleError: function (event) {
      try {
        this.track('error', {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error ? event.error.stack : undefined
        });
      } catch (error) {
        console.error('ChurnGuardian: Error handling error event:', error);
      }
    },

    /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
    _handlePromiseRejection: function (event) {
      try {
        this.track('promise_rejection', {
          message: event.reason ? (event.reason.message || String(event.reason)) : 'Promise rejected'
        });
      } catch (error) {
        console.error('ChurnGuardian: Error handling promise rejection:', error);
      }
    },

    /**
     * Send event data to the API
     * @param {object} event - Event data to send
     */
    _sendEvent: function (event) {
      if (!this.state.initialized) {
        this.state.eventQueue.push(event);
        return;
      }

      // Limit concurrent requests
      if (this.state.requestsInProgress > 10) {
        this.state.eventQueue.push(event);
        return;
      }

      this.state.requestsInProgress++;
      
      const sendWithRetry = (retryCount = 0) => {
        fetch(`${this.config.endpoint}/track-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this._log('Event sent successfully:', event.event_type);
          this.state.requestsInProgress--;
          this._processQueue(); // Process next event in queue
        })
        .catch(error => {
          this._log('Error sending event:', error);
          
          // Retry logic
          if (retryCount < this.config.retryAttempts) {
            setTimeout(() => {
              sendWithRetry(retryCount + 1);
            }, this.config.retryDelay * Math.pow(2, retryCount));
          } else {
            this.state.errorCount++;
            this.state.requestsInProgress--;
            this._processQueue(); // Continue to next event after max retries
          }
        });
      };

      sendWithRetry();
    },

    /**
     * Process queued events
     */
    _processQueue: function () {
      if (this.state.eventQueue.length === 0 || this.state.requestsInProgress > 10) {
        return;
      }

      const queue = [...this.state.eventQueue];
      this.state.eventQueue = [];

      queue.forEach(event => {
        this._sendEvent(event);
      });
    },

    /**
     * Generate a random anonymous ID
     * @returns {string} Random ID
     */
    _generateAnonymousId: function () {
      return 'anon_' + Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
    },

    /**
     * Generate a session ID
     * @returns {string} Session ID
     */
    _generateSessionId: function () {
      return 'session_' + Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15) + '_' + 
        new Date().getTime();
    },

    /**
     * Get user ID from localStorage
     * @returns {string|null} Stored user ID
     */
    _getUserIdFromStorage: function () {
      try {
        return localStorage.getItem('cg_user_id');
      } catch (e) {
        this._log('Error getting user ID from storage:', e);
        return null;
      }
    },

    /**
     * Save user ID to localStorage
     * @param {string} userId - User ID to save
     */
    _saveUserIdToStorage: function (userId) {
      try {
        localStorage.setItem('cg_user_id', userId);
      } catch (e) {
        this._log('Error saving user ID to storage:', e);
      }
    },

    /**
     * Extract user ID from URL parameter
     * @returns {string|null} User ID from URL
     */
    _getUserIdFromUrl: function () {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(this.config.userIdParam);
      } catch (e) {
        this._log('Error extracting user ID from URL:', e);
        return null;
      }
    },

    /**
     * Log messages if debug mode is enabled
     */
    _log: function (...args) {
      if (this.config.debug) {
        console.log('[ChurnGuardian]', ...args);
      }
    }
  };

  // Expose to window
  window.ChurnGuardian = ChurnGuardian;
})(window);
