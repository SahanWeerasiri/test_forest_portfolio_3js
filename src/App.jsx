import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';

const App = () => {
    return (
        <main className="bg-white">
            <Router basename="/portfolio/">
                <Routes>
                    <Route path='/' element={<Home />} />
                </Routes>
            </Router>
        </main>
    )
}

export default App