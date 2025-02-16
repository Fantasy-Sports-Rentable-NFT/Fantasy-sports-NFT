import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import Header from './menu/header';
import Landing from './pages/Landing';
import Mint from './pages/mint';
import Collection from './pages/collection';
import Holdings from './pages/holdings';
import { AccountTypeContext } from './../appContexts';

const queryClient = new QueryClient()

export const AccountContext = createContext<Partial<AccountTypeContext>>({});

const App: React.FC = () => {
  const [globalAccount, setGlobalAccount] = useState("");
  const [globalActive, setGlobalActive] = useState(false);
  const [globalChainId, setGlobalChainId] = useState(0)

  return (
    <div className="wrapper">
      <AccountContext.Provider value={{globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId}}>
        
        <QueryClientProvider client={queryClient}>
        <Router>
          <Header/>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/profile" element={<Collection />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/mint" element={<Mint />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AccountContext.Provider>    
    </div>
  );
}

export default App;
