# ARTEFAC - AIoT Dashboard

Artos Real-Time Adaptive Traffic, Automatic Lighting & Waste Control System

## Project Overview

ARTEFAC is a comprehensive AIoT monitoring and control dashboard for Simpang Artos, Magelang. The system integrates three main subsystems:

1. **Adaptive Traffic**: 8 infrared sensors for vehicle detection and AI-powered traffic prediction
2. **Smart Waste**: Ultrasonic sensors for waste bin fullness monitoring
3. **Smart Lighting**: LDR sensors for automated street light control

## Features

### Dashboard Pages
- **Login Page**: Split-screen design with animated traffic simulation
- **Dashboard**: Overview with real-time statistics and AI recommendations
- **Traffic Intelligence**: Real-time sensor monitoring and AI predictions
- **Smart Waste**: Waste bin monitoring and collection scheduling
- **Smart Lighting**: Light intensity control and energy monitoring
- **Device Status**: IoT device connectivity and health monitoring
- **Settings**: System configuration and user preferences

### Technical Implementation
- Built with React + TypeScript + Vite
- Tailwind CSS for styling with Dark Smart City theme
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- React Router for navigation
- React Hot Toast for notifications

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components (Layout, etc.)
│   ├── pages/         # Page components (Dashboard, Traffic, etc.)
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main app with routing
│   ├── main.tsx       # Entry point
│   └── index.css      # Tailwind CSS styles
├── public/            # Static assets
├── images/           # Image assets
│   └── Logo Artefac.webp
├── package.json      # Dependencies
├── vite.config.ts    # Vite configuration
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
├── tsconfig.json     # TypeScript configuration
└── index.html        # HTML entry point
```

## Design System

### Theme: Dark Smart City / AIoT Control Center
- **Primary Color**: Deep blue (#0ea5e9) for interactive elements
- **Background**: Dark gradient with subtle grid pattern
- **Typography**: Inter font family with JetBrains Mono for code
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and subtle micro-interactions

### UI Components
- **Cards**: Glass-morphism effect with subtle borders
- **Buttons**: Primary, secondary, and ghost variants
- **Forms**: Consistent input styles with validation
- **Charts**: Recharts with custom color schemes
- **Navigation**: Sidebar with active state indicators

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The development server runs on `http://localhost:3000`

## Key Pages Implementation

### 1. Login Page
- Split-screen layout with animated traffic simulation
- Form validation and authentication flow
- Responsive design for all screen sizes

### 2. Dashboard
- Real-time statistics cards with trend indicators
- Interactive charts for traffic, waste, and lighting data
- AI recommendations and system alerts
- Device status overview

### 3. Traffic Intelligence
- Interactive traffic map with sensor visualization
- Real-time sensor data monitoring
- AI predictions for traffic density
- Traffic light control recommendations

### 4. Smart Waste
- Waste bin monitoring with fullness indicators
- Collection scheduling and priority management
- Historical data visualization
- Alert system for full/near-full bins

### 5. Smart Lighting
- Light intensity monitoring and control
- Energy consumption tracking
- Automated scheduling system
- Manual override capability

### 6. Device Status
- IoT device connectivity monitoring
- Battery level tracking
- System performance metrics
- Device troubleshooting alerts

### 7. Settings
- User account management
- System preferences configuration
- Traffic control parameter adjustment
- Data management and export

## API Integration Points

The dashboard is designed to integrate with the following backend services:

1. **Sensor Data API**: Real-time data from ESP32 devices via LoRa
2. **AI Prediction API**: Traffic density predictions and recommendations
3. **Device Management API**: IoT device status and control
4. **User Authentication API**: Login and session management

## Responsive Design

- **Desktop (≥ 1024px)**: Full dashboard with sidebar navigation
- **Tablet (768px - 1023px)**: Optimized layout with collapsible sidebar
- **Mobile (≤ 767px)**: Stacked layout with hamburger menu

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

### State Management
- Local state using React hooks
- No external state management library needed for MVP
- Context API planned for future authentication

### Performance Optimization
- Code splitting with React Router
- Lazy loading for charts and heavy components
- Optimized re-renders with React.memo
- Efficient animations with Framer Motion

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels for interactive elements
- Color contrast compliance

## Future Enhancements

1. **Real-time WebSocket integration** for live data updates
2. **Advanced AI visualization** for traffic prediction models
3. **Mobile app version** using React Native
4. **Multi-language support** for internationalization
5. **Advanced analytics** with historical data comparison
6. **Alert management system** with notification center
7. **Role-based access control** for different user types

## License

Proprietary - ARTEFAC System for Simpang Artos, Magelang
