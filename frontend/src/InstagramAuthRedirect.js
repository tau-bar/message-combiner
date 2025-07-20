import React, { useEffect, useState } from 'react';

function InstagramAuthRedirect() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (code) {
      // Remove any trailing #_
      const cleanCode = code.replace(/#_$/, '');
      fetch('https://message-combiner.onrender.com/ig_token_exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      })
        .then(res => res.json())
        .then(data => {
          setStatus('success');
          setMessage('Authentication successful! Token exchanged.');
        })
        .catch(err => {
          setStatus('error');
          setMessage('Failed to exchange token: ' + err.message);
        });
    } else if (error) {
      setStatus('error');
      setMessage('Authorization failed: ' + params.get('error_description'));
    } else {
      setStatus('error');
      setMessage('No code or error returned from Instagram.');
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      {status === 'loading' && <p>Processing Instagram authentication...</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default InstagramAuthRedirect; 