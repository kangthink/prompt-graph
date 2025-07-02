import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';
import FlowCanvas from './FlowCanvas';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  </StrictMode>
); 