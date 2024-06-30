import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';
import { LoginPage } from './component/auth/login';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const socket = io('http://localhost:5000'); // Add the correct API link here

interface PriceData {
  bitcoin: { usd: number };
  ethereum: { usd: number };
  dogecoin: { usd: number };
}

interface HistoryData {
  bitcoin: { timestamp: number; usd: number }[];
  ethereum: { timestamp: number; usd: number }[];
  dogecoin: { timestamp: number; usd: number }[];
}

const App: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
  const [prices, setPrices] = useState<HistoryData>(() => {
    const savedPrices = localStorage.getItem('priceData');
    return savedPrices
      ? JSON.parse(savedPrices)
      : { bitcoin: [], ethereum: [], dogecoin: [] };
  });
  const [isAuth, setIsAuth] = useState(() => {
    const savedAuth = localStorage.getItem('isAuth');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });
  const [isLog, setIsLog] = useState(false);
 

  useEffect(() => {
    socket.on('update_prices', (data: PriceData) => {
      console.log('Received prices:', data); // Log the received prices
      const timestamp = Date.now();
      const newPrices = {
        bitcoin: [...prices.bitcoin, { timestamp, usd: data.bitcoin.usd }],
        ethereum: [...prices.ethereum, { timestamp, usd: data.ethereum.usd }],
        dogecoin: [...prices.dogecoin, { timestamp, usd: data.dogecoin.usd }],
      };
      setPrices(newPrices);
      localStorage.setItem('priceData', JSON.stringify(newPrices));
    });

    return () => {
      socket.off('update_prices');
    };
  }, [prices]);

  const chartData = {
    labels: prices.bitcoin.map((price) =>
      price ? new Date(price.timestamp).toLocaleTimeString() : ''
    ),
    datasets: [
      {
        label: 'Bitcoin',
        data: prices.bitcoin.map((price) => price ? price.usd : null),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Ethereum',
        data: prices.ethereum.map((price) => price ? price.usd : null),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Dogecoin',
        data: prices.dogecoin.map((price) => price ? price.usd : null),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '$ Price in USD',
        },
      },
    },
  };



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password }),
      });
      if (response.ok) {
        setIsAuth(true);
        localStorage.setItem('isAuth', JSON.stringify(true));
        console.log('Registration successful'); // Log registration success
      } else {
        console.error('Failed to register');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="App">
      {!isAuth ? (
        <div>
          {!isLog ? (
           <LoginPage/>
          ) : (
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Register</button>
              <button type="button" onClick={() => setIsLog(!isLog)}>Switch to Login</button>
            </form>
          )}
        </div>
      ) : (
        <>
          <h1> Iboytech Cryptocurrency Price Tracker</h1>
          <div className="price-container">
            <h2>Bitcoin: ${prices.bitcoin[prices.bitcoin.length - 1]?.usd ?? 'Loading...'}</h2>
            <h2>Ethereum: ${prices.ethereum[prices.ethereum.length - 1]?.usd ?? 'Loading...'}</h2>
            <h2>Dogecoin: ${prices.dogecoin[prices.dogecoin.length - 1]?.usd ?? 'Loading...'}</h2>
          </div>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
