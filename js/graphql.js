/**
 * GraphQL Client Module
 */
const GraphQL = (function() {
  const { GRAPHQL_URL } = APP_CONFIG.API;
  
  /**
   * Execute a GraphQL query or mutation
   * @param {string} query - GraphQL query or mutation string
   * @param {Object} variables - Variables for the query (optional)
   * @param {string} token - JWT token for authentication
   * @return {Promise} - Promise resolving to query result
   */
  async function execute(query, variables = {}, token) {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GraphQL request failed: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('GraphQL response:', data);
      if (data.errors) {
        throw new Error(data.errors[0].message || 'GraphQL query returned errors');
      }
      
      return { success: true, data: data.data };
    } catch (error) {
      console.error('GraphQL error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during the GraphQL operation' 
      };
    }
  }
  
  /**
   * Fetch user profile data
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to user data
   */
  function fetchUserProfile(token) {
    const query = `
      query {
        user {
          id
          login
          attrs
          auditRatio
          skills: transactions(where: { type: { _like: "skill_%" } }, order_by: [{ amount: desc }]) {
            type
            amount
          }
          audits(order_by: { createdAt: desc }, where: { closedAt: { _is_null: true }, group: { captain: { canAccessPlatform: { _eq: true } } } }) {
            closedAt
            group {
              captain {
                canAccessPlatform
              }
              captainId
              captainLogin
              path
              createdAt
              updatedAt
              members {
                userId
                userLogin
              }
            }
            private {
              code
            }
          }
          events(where: { eventId: { _eq: 75 } }) {
            level
          }
        }
        transaction(where: { _and: [{ eventId: { _eq: 75 } }] }, order_by: { createdAt: desc }) {
          amount
          createdAt
          eventId
          path
          type
          userId
        }
        progress(where: { _and: [{ grade: { _is_null: false } }, { eventId: { _eq: 75 } }] }, order_by: { createdAt: desc }) {
          id
          createdAt
          eventId
          grade
          path
        }
      }
    `;
    
    return execute(query, {}, token);
  }
  
  /**
   * Fetch basic user info
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to basic user info
   */
  function fetchBasicUserInfo(token) {
    const query = `
      query {
        user {
          id
          login
        }
      }
    `;
    
    return execute(query, {}, token);
  }
  
  /**
   * Update user attributes
   * @param {string} token - JWT token
   * @param {Object} attrs - User attributes to update
   * @return {Promise} - Promise resolving to update result
   */
  function updateUserAttributes(token, attrs) {
    const mutation = `
      mutation UpdateUserAttrs($attrs: json!) {
        updateUser(attrs: $attrs) {
          id
          attrs
        }
      }
    `;
    
    return execute(mutation, { attrs }, token);
  }
  
  // Public API
  return {
    execute,
    fetchUserProfile,
    fetchBasicUserInfo,
    updateUserAttributes
  };
})();