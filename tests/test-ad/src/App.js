import React, { useEffect, useState } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { notification } from 'antd';

function App() {
  const [api1, contextHolder] = notification.useNotification();
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);

  useEffect(() => {
    let sock = new SockJS('http://localhost:9090/ws');
    const client = over(sock);

    const handleProductUpdate = (payload) => {
      const newProduct = JSON.parse(payload.body);
      setLastProduct(newProduct.product);
      setCount(newProduct.total);
    };

    client.connect({}, (frame) => {
      if (frame) {
        console.log('Connected to WebSocket');
        setConnected(true);
        client.subscribe('/topic/product', handleProductUpdate);
      } else {
        console.error('Connection error');
      }
    });

    return () => {
      if (client && client.connected) {
        client.disconnect();
        console.log('Disconnected from WebSocket');
      }
    };
  }, []);

  useEffect(() => {
    if (lastProduct) {
      api1.info({
        message: 'New Order Received',
        description: `Product Name: ${lastProduct.product}, Quantity: ${lastProduct.quantity}, User: ${lastProduct.user}`,
        placement: 'topRight'
      });
    }
  }, [lastProduct, api1]);

  return (
    <div className="App">
      {connected ? (
        <div>
          {contextHolder}
          Total orders: {count}
        </div>
      ) : (
        <div>
          <p>Connecting ...</p>
        </div>
      )}
    </div>
  );
}

export default App;
