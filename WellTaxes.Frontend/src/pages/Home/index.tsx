import { type FC, useState } from 'react';

import CreateOrderModal from '@/widgets/CreateOrderModal';

const Home: FC = () => {
  const [visible, setVisible] = useState(false);

  const handleCalculate = (): void => {
    setVisible(true);
  };

  return (
    <>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>

      <button
        onClick={handleCalculate}
        style={{
          marginTop: 16,
          padding: '10px 24px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        View model
      </button>
    </div>
      <CreateOrderModal visible={visible} setVisible={setVisible} />
    </>
  );
};

export default Home;
