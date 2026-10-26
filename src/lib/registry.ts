import { useEffect, useState } from 'react'

/** Live lookups against the ClinicalTrials.gov v2 API (CORS-enabled). */
export interface RegistryRecord {
  nct: string
  title: string
  acronym?: string
  status: string
  whyStopped?: string
  phases: string[]
  enrollment?: number
  sponsor?: string
  conditions: string[]
  interventions: string[]
  firstPosted?: string
  start?: string
  primaryCompletion?: string
  completion?: string
  lastUpdate?: string
  hasResults: boolean
  briefSummary?: string
}

const cache = new Map<string, Promise<RegistryRecord>>()

export function fetchRegistry(nct: string): Promise<RegistryRecord> {
  const key = nct.toUpperCase()
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`https://clinicaltrials.gov/api/v2/studies/${key}?format=json`).then(async (r) => {
        if (!r.ok) throw new Error(r.status === 404 || r.status === 400 ? `No trial with the ID ${key} was found in ClinicalTrials.gov.` : `ClinicalTrials.gov returned an error (${r.status}). Try again later.`)
        const j = await r.json()
        const p = j.protocolSection ?? {}
        const id = p.identificationModule ?? {}
        const st = p.statusModule ?? {}
        return {
          nct: key,
          title: id.officialTitle ?? id.briefTitle ?? key,
          acronym: id.acronym,
          status: (st.overallStatus ?? 'UNKNOWN').replace(/_/g, ' ').toLowerCase(),
          whyStopped: st.whyStopped,
          phases: p.designModule?.phases ?? [],
          enrollment: p.designModule?.enrollmentInfo?.count,
          sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name,
          conditions: p.conditionsModule?.conditions ?? [],
          interventions: (p.armsInterventionsModule?.interventions ?? []).map((i: { name: string }) => i.name),
          firstPosted: st.studyFirstPostDateStruct?.date,
          start: st.startDateStruct?.date,
          primaryCompletion: st.primaryCompletionDateStruct?.date,
          completion: st.completionDateStruct?.date,
          lastUpdate: st.lastUpdatePostDateStruct?.date,
          hasResults: Boolean(j.hasResults),
          briefSummary: p.descriptionModule?.briefSummary,
        }
      }),
    )
    cache.get(key)!.catch(() => cache.delete(key))
  }
  return cache.get(key)!
}

type State = { status: 'loading' } | { status: 'ok'; data: RegistryRecord } | { status: 'error'; message: string }

export function useRegistry(nct: string): State {
  const [state, setState] = useState<State>({ status: 'loading' })
  useEffect(() => {
    let live = true
    setState({ status: 'loading' })
    fetchRegistry(nct).then(
      (data) => live && setState({ status: 'ok', data }),
      (e: Error) => live && setState({ status: 'error', message: e.message || 'Could not reach ClinicalTrials.gov.' }),
    )
    return () => {
      live = false
    }
  }, [nct])
  return state
}
