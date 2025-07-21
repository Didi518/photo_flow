'use client';

import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { persistStore, type Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import store from '@/store/store';

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [persistor, setPersistor] = useState<Persistor | null>(null);

  useEffect(() => {
    const clientPersistor = persistStore(store);
    setPersistor(clientPersistor);
  }, []);

  if (!persistor) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ClientProvider;
