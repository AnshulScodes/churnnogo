
/**
 * ChurnGuardian - User behavior tracking SDK for churn prediction
 * v1.0.0
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
      debug: config.debug || false
    };

    // State
    this.state = {
      userId: config.userId || this._getUserIdFromStorage() || this._generateAnonymousId(),
      sessionId: this._generateSessionId(),
      startTime: new Date(),
      initialized: false,
      eventQueue: []
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

      // Mark as initialized
      this.state.initialized = true;
      this._log('ChurnGuardian initialized');

      // Process any queued events
      this._processQueue();
    },

    /**
     * Identify a user
     * @param {string} userId - Unique user identifier
     * @param {object} traits - User traits/properties
     */
    identify: function (userId, traits = {}) {
      if (!userId) return;

      this.state.userId = userId;
      this._saveUserIdToStorage(userId);
      
      this.track('identify', {
        previous_id: this.state.userId !== userId ? this.state.userId : undefined,
        traits: traits
      });
      
      this._log('User identified:', userId, traits);
    },

    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {object} properties - Properties associated with the event
     */
    track: function (eventName, properties = {}) {
      if (!eventName) return;

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
      .then(response => response.json())
      .then(data => {
        this._log('Prediction received:', data);
        if (callback) callback(null, data.prediction);
      })
      .catch(error => {
        this._log('Error getting prediction:', error);
        if (callback) callback(error, null);
      });
    },

    /**
     * Reset the current session
     */
    resetSession: function () {
      this.state.sessionId = this._generateSessionId();
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
    },

    /**
     * Handle form submission events
     * @param {Event} event - Form submission event
     */
    _handleFormSubmit: function (event) {
      const form = event.target;
      if (!form || form.tagName.toLowerCase() !== 'form') return;

      this.track('form_submit', {
        form_id: form.id || undefined,
        form_name: form.name || undefined,
        form_action: form.action || undefined
      });
    },

    /**
     * Handle JavaScript errors
     * @param {ErrorEvent} event - Error event
     */
    _handleError: function (event) {
      this.track('error', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : undefined
      });
    },

    /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
    _handlePromiseRejection: function (event) {
      this.track('promise_rejection', {
        message: event.reason ? (event.reason.message || String(event.reason)) : 'Promise rejected'
      });
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
      })
      .catch(error => {
        this._log('Error sending event:', error);
        // Retry logic could be implemented here
      });
    },

    /**
     * Process queued events
     */
    _processQueue: function () {
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
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(this.config.userIdParam);
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
