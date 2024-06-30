/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import "../../App.css"
import { color } from 'chart.js/helpers';





export const LoginPage = () => {
    // const [username, setUsername] = useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [showPassword, setSP] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (response.ok) {
            // setIsAuth(true);
            localStorage.setItem('isAuth', JSON.stringify(true));
            console.log('Login successful'); 
          } else {
            console.error('Failed to login');
          }
        } catch (error) {
          console.error('Error during login:', error);
        }
      };
  return (
    <div  >  
    <form onSubmit={handleLogin}>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    
    <input
      type={showPassword ? 'text' : 'password'}
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    /> 
 <span className='pass'> <input type="checkbox" style={{ display: 'flex' }}
    onClick={() => setSP((x) => !x)} checked={showPassword? true:false } name="" id="" />Show Password</span>
    <button type="submit">Login</button>   
  </form></div>
  )
}
