import React from 'react';

import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import styled from 'styled-components';

function App() {

  return (
    <RootWrapper>
      <NavBar />
      <Dashboard />
    </RootWrapper>
    
  );
}

const RootWrapper = styled.div`
  padding: 0;
  margin: 0;
`
export default App;
