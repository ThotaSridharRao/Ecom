import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <DotLottieReact
        src="https://lottie.host/700b5839-d4e5-4634-9f43-4cc0e725709e/S2uUt1I385.lottie"
        loop
        autoplay
        style={{ width: '300px', height: '300px' }}
      />
    </div>
  );
};

export default Loader;
