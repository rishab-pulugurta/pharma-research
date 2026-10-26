import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { CompanyPage } from './pages/CompanyPage'
import { Compare } from './pages/Compare'
import { DiseasePage } from './pages/DiseasePage'
import { DrugPage } from './pages/DrugPage'
import { Explore } from './pages/Explore'
import { Home } from './pages/Home'
import { MapPage } from './pages/MapPage'
import { LiveCompanyPage } from './pages/LiveCompanyPage'
import { PathwayPage } from './pages/PathwayPage'
import { Regulatory } from './pages/Regulatory'
import { TargetPage } from './pages/TargetPage'
import { TrialPage } from './pages/TrialPage'
import { Updates } from './pages/Updates'
import { Workspace } from './pages/Workspace'
import { NotFound } from './components/bits'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/:kind" element={<Explore />} />
        <Route path="companies" element={<Explore fixed="company" />} />
        <Route path="companies/live/:name" element={<LiveCompanyPage />} />
        <Route path="companies/:id" element={<CompanyPage />} />
        <Route path="drugs" element={<Explore fixed="drug" />} />
        <Route path="drugs/:id" element={<DrugPage />} />
        <Route path="diseases" element={<Explore fixed="disease" />} />
        <Route path="diseases/:id" element={<DiseasePage />} />
        <Route path="targets" element={<Explore fixed="target" />} />
        <Route path="targets/:id" element={<TargetPage />} />
        <Route path="trials" element={<Explore fixed="trial" />} />
        <Route path="trials/:nct" element={<TrialPage />} />
        <Route path="pathways" element={<Explore fixed="pathway" />} />
        <Route path="pathways/:id" element={<PathwayPage />} />
        <Route path="compare" element={<Compare />} />
        <Route path="regulatory" element={<Regulatory />} />
        <Route path="updates" element={<Updates />} />
        <Route path="map" element={<MapPage />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound what="This page" />} />
      </Route>
    </Routes>
  )
}
