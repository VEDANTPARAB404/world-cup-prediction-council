import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database,
  Cpu, 
  Network, 
  BookOpen, 
  Plus, 
  Trash2, 
  Terminal,
  Zap,
  Flame,
  Activity
} from 'lucide-react';
import { Contender, DebateLog, ModeratorOutput, WorkflowStep } from './types';
import { ProjectFile } from './pythonAssets';
import { ALL_48_CONTENDERS } from './data';
import { runSimulation } from './debateEngine';
import DebateRoom from './components/DebateRoom';
import ConsensusReport from './components/ConsensusReport';
import FifaTrophyLogo from './components/FifaTrophyLogo';
import { checkAndTraceLiveDataAvailability } from './liveDataAvailability';
import { footballStore, useFootballStore } from './footballStore';

const COUNTRY_MAP: Record<string, string> = {
  argentina: 'ar',
  france: 'fr',
  spain: 'es',
  england: 'gb-eng',
  brazil: 'br',
  brasil: 'br',
  germany: 'de',
  deutschland: 'de',
  portugal: 'pt',
  italy: 'it',
  italia: 'it',
  netherlands: 'nl',
  holland: 'nl',
  croatia: 'hr',
  belgium: 'be',
  uruguay: 'uy',
  usa: 'us',
  'united states': 'us',
  mexico: 'mx',
  japan: 'jp',
  senegal: 'sn',
  morocco: 'ma',
  switzerland: 'ch',
  colombia: 'co',
  sweden: 'se',
  denmark: 'dk',
  'south korea': 'kr',
  korea: 'kr',
  austria: 'at',
  australia: 'au',
  ukraine: 'ua',
  turkey: 'tr',
  ecuador: 'ec',
  wales: 'gb-wls',
  poland: 'pl',
  egypt: 'eg',
  hungary: 'hu',
  'ivory coast': 'ci',
  qatar: 'qa',
  canada: 'ca',
  nigeria: 'ng',
  panama: 'pa',
  peru: 'pe',
  chile: 'cl',
  cameroon: 'cm',
  algeria: 'dz',
  tunisia: 'tn',
  mali: 'ml',
  'costa rica': 'cr',
  'saudi arabia': 'sa',
  iraq: 'iq',
  ghana: 'gh',
  'new zealand': 'nz',
  'bosnia and herzegovina': 'ba',
  'cape verde': 'cv',
  'cabo verde': 'cv',
  'curaçao': 'cw',
  'curacao': 'cw',
  'czechia': 'cz',
  'dr congo': 'cd',
  'haiti': 'ht',
  'jordan': 'jo',
  'norway': 'no',
  'paraguay': 'py',
  'scotland': 'gb-sct',
  'south africa': 'za',
  'uzbekistan': 'uz'
};

function getCountryFlag(name: string, emojiFallback: string = '🏳️', sizeClass: string = 'w-5 h-3.5') {
  const norm = name.toLowerCase().trim();
  let code = '';
  for (const [key, value] of Object.entries(COUNTRY_MAP)) {
    if (norm.includes(key)) {
      code = value;
      break;
    }
  }

  if (code) {
    return (
      <div className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-xs border border-white/10 flex items-center justify-center bg-slate-900`}>
        <span className="absolute text-[10px] opacity-40 select-none">{emojiFallback}</span>
        <img 
          src={`https://flagcdn.com/w40/${code}.png`} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }
  return <span className="text-[14px] select-none">{emojiFallback}</span>;
}

function getConfederation(team: Contender): string {
  const uefa = ['France', 'Spain', 'England', 'Portugal', 'Netherlands', 'Italy', 'Germany', 'Croatia', 'Switzerland', 'Denmark', 'Austria', 'Ukraine', 'Turkey', 'Sweden', 'Wales', 'Poland', 'Hungary', 'Belgium', 'Bosnia and Herzegovina', 'Czechia', 'Norway', 'Scotland'];
  const conmebol = ['Argentina', 'Brazil', 'Colombia', 'Uruguay', 'Ecuador', 'Peru', 'Chile', 'Paraguay'];
  const concacaf = ['USA', 'United States', 'Mexico', 'Canada', 'Panama', 'Costa Rica', 'Curaçao', 'Haiti'];
  const caf = ['Morocco', 'Senegal', 'Egypt', 'Ivory Coast', 'Nigeria', 'Cameroon', 'Algeria', 'Tunisia', 'Mali', 'Ghana', 'Cape Verde', 'DR Congo', 'South Africa'];
  const afc_ofc = ['Japan', 'Iran', 'South Korea', 'Australia', 'Qatar', 'Saudi Arabia', 'Iraq', 'New Zealand', 'Jordan', 'Uzbekistan'];

  if (uefa.includes(team.name)) return 'UEFA';
  if (conmebol.includes(team.name)) return 'CONMEBOL';
  if (concacaf.includes(team.name)) return 'CONCACAF';
  if (caf.includes(team.name)) return 'CAF';
  if (afc_ofc.includes(team.name)) return 'AFC/OFC';
  return 'OTHER';
}

function renderFormBadges(recentForm: string) {
  return (
    <div className="flex gap-1">
      {recentForm.split(' ').map((char, index) => {
        let bg = 'bg-slate-800 text-slate-400 border border-slate-750';
        if (char === 'W') bg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        if (char === 'D') bg = 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
        if (char === 'L') bg = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
        return (
          <span 
            key={index} 
            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-black ${bg}`}
            title={char === 'W' ? 'Won' : char === 'D' ? 'Drew' : 'Lost'}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

const INITIAL_CONTENDERS: Contender[] = ALL_48_CONTENDERS.filter(c => 
  ['arg', 'esp', 'fra', 'eng', 'bra', 'ger', 'por', 'col'].includes(c.id)
);

const DISCUSSION_ROUNDS = 2;

export default function App() {
  const [contenders, setContenders] = useState<Contender[]>(INITIAL_CONTENDERS);
  const [rosterContenders, setRosterContenders] = useState<Contender[]>(ALL_48_CONTENDERS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'instructions_tab'>('simulation');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [apiMode, setApiMode] = useState<'live-ai' | 'local-simulation'>('local-simulation');
  const [hasCopiedFile, setHasCopiedFile] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<WorkflowStep>('SEQUENTIAL_DATA');

  // Input fields for new custom contender
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamFlag, setNewTeamFlag] = useState('🏳️');
  const [newFifaRank, setNewFifaRank] = useState(10);
  const [newElo, setNewElo] = useState(1850);
  const [newCoach, setNewCoach] = useState('');
  const [newStars, setNewStars] = useState('');
  const [newForm, setNewForm] = useState('W D L W W');
  const [newGs, setNewGs] = useState(14);
  const [newGc, setNewGc] = useState(11);

  // 48-Nation pool catalog states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedConfed, setSelectedConfed] = useState('ALL');

  // Live Sports Statistics Sync Pipeline States
  const { data: globalFootballData, isSyncing: storeIsSyncing, syncStatus: storeSyncStatus } = useFootballStore();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [searchCitations, setSearchCitations] = useState<Array<{ title: string; uri: string }>>([]);
  const [searchNewsSummary, setSearchNewsSummary] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  useEffect(() => {
    setIsSyncing(storeIsSyncing);
    setSyncStatus(storeSyncStatus);
  }, [storeIsSyncing, storeSyncStatus]);

  const applyLiveDataToContenders = (list: Contender[], data: any): Contender[] => {
    let updatedList = [...list];

    // 1. Update FIFA Rankings
    if (data.fifaRankings) {
      updatedList = updatedList.map(c => {
        const key = Object.keys(data.fifaRankings).find(k => k.toLowerCase().trim() === c.name.toLowerCase().trim());
        const fetchedRank = key ? data.fifaRankings[key] : undefined;
        if (fetchedRank !== undefined) {
          return {
            ...c,
            fifaRanking: typeof fetchedRank === 'number' ? fetchedRank : parseInt(fetchedRank) || c.fifaRanking
          };
        }
        return c;
      });
    }

    // 1.5. Update Recent Forms
    const formSource = data.recentForms || data.teamForm;
    if (formSource) {
      updatedList = updatedList.map(c => {
        const key = Object.keys(formSource).find(k => k.toLowerCase().trim() === c.name.toLowerCase().trim());
        const fetchedForm = key ? formSource[key] : undefined;
        if (fetchedForm) {
          return {
            ...c,
            recentForm: fetchedForm
          };
        }
        return c;
      });
    }

    // 2. Register live matched outcomes from search
    if (data.latestMatches && Array.isArray(data.latestMatches)) {
      for (const rawMatch of data.latestMatches) {
        const teamHome = updatedList.find(c => c.name.toLowerCase() === rawMatch.homeTeam.toLowerCase());
        const teamAway = updatedList.find(c => c.name.toLowerCase() === rawMatch.awayTeam.toLowerCase());
        
        if (teamHome || teamAway) {
          // Calculate Elo updates
          const K = 40;
          const hElo = teamHome ? teamHome.eloRating : 1800;
          const aElo = teamAway ? teamAway.eloRating : 1800;
          const expectedHome = 1 / (1 + Math.pow(10, (aElo - hElo) / 400));
          const expectedAway = 1 / (1 + Math.pow(10, (hElo - aElo) / 400));
          
          let actualHome = 0.5;
          let actualAway = 0.5;
          if (rawMatch.homeScore > rawMatch.awayScore) {
            actualHome = 1;
            actualAway = 0;
          } else if (rawMatch.awayScore > rawMatch.homeScore) {
            actualHome = 0;
            actualAway = 1;
          }
          
          const hEloDiff = Math.round(K * (actualHome - expectedHome));
          const aEloDiff = Math.round(K * (actualAway - expectedAway));
          
          const homeOutcome = rawMatch.homeScore > rawMatch.awayScore ? 'W' : rawMatch.homeScore === rawMatch.awayScore ? 'D' : 'L';
          const awayOutcome = rawMatch.awayScore > rawMatch.homeScore ? 'W' : rawMatch.homeScore === rawMatch.awayScore ? 'D' : 'L';
          
          const updateForm = (oldForm: string, outcome: 'W' | 'D' | 'L') => {
            const formList = oldForm.split(' ');
            formList.unshift(outcome);
            if (formList.length > 5) formList.pop();
            return formList.join(' ');
          };

          updatedList = updatedList.map(c => {
            const hasRecentForm = formSource && Object.keys(formSource).some(k => k.toLowerCase().trim() === c.name.toLowerCase().trim());
            if (teamHome && c.id === teamHome.id) {
              return {
                ...c,
                eloRating: c.eloRating + hEloDiff,
                goalsScoredLast10: c.goalsScoredLast10 + rawMatch.homeScore,
                goalsConcededLast10: c.goalsConcededLast10 + rawMatch.awayScore,
                recentForm: hasRecentForm ? c.recentForm : updateForm(c.recentForm, homeOutcome)
              };
            }
            if (teamAway && c.id === teamAway.id) {
              return {
                ...c,
                eloRating: c.eloRating + aEloDiff,
                goalsScoredLast10: c.goalsScoredLast10 + rawMatch.awayScore,
                goalsConcededLast10: c.goalsConcededLast10 + rawMatch.homeScore,
                recentForm: hasRecentForm ? c.recentForm : updateForm(c.recentForm, awayOutcome)
              };
            }
            return c;
          });
        }
      }
    }

    return updatedList;
  };

  useEffect(() => {
    if (!globalFootballData) return;

    // 1. Update searchCitations and searchNewsSummary
    if (globalFootballData.citations) {
      setSearchCitations(globalFootballData.citations);
    }
    if (globalFootballData.newsSummary) {
      setSearchNewsSummary(globalFootballData.newsSummary);
    }
    if (globalFootballData.retrievedAt) {
      setLastRefreshed(new Date(globalFootballData.retrievedAt).toLocaleTimeString());
    }

    // 2. Update contenders and rosterContenders reactively!
    setContenders(prev => {
      const updated = applyLiveDataToContenders(prev, globalFootballData);
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        return updated;
      }
      return prev;
    });

    setRosterContenders(prev => {
      const updated = applyLiveDataToContenders(prev, globalFootballData);
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        return updated;
      }
      return prev;
    });

    // 3. Register live matched outcomes from search
    if (globalFootballData.matches && Array.isArray(globalFootballData.matches)) {
      const newlyPlayedMatches: typeof playedMatches = [];
      
      const finishedMatches = globalFootballData.matches.filter((m: any) => m.status === "FINISHED" || m.status === "AWARDED");

      for (const rawMatch of finishedMatches) {
        const homeTeamName = rawMatch.homeTeam?.name || "";
        const awayTeamName = rawMatch.awayTeam?.name || "";

        const teamHome = contenders.find(c => c.name.toLowerCase() === homeTeamName.toLowerCase());
        const teamAway = contenders.find(c => c.name.toLowerCase() === awayTeamName.toLowerCase());
        
        if (teamHome || teamAway) {
          const compCode = rawMatch.competition?.code || "UNKNOWN";
          const mId = String(rawMatch.id);
          const utcDate = rawMatch.utcDate || "";
          const apiEndpoint = `https://api.football-data.org/v4/competitions/${compCode}/matches`;

          const scoreHome = rawMatch.score?.fullTime?.home;
          const scoreAway = rawMatch.score?.fullTime?.away;
          const homeScore = typeof scoreHome === "number" ? scoreHome : 0;
          const awayScore = typeof scoreAway === "number" ? scoreAway : 0;

          const isMatchAlreadyAdded = newlyPlayedMatches.some(m => 
            m.homeTeam.toLowerCase() === homeTeamName.toLowerCase() &&
            m.awayTeam.toLowerCase() === awayTeamName.toLowerCase()
          );
  
          // Calculate Elo updates
          const K = 40;
          const hElo = teamHome ? teamHome.eloRating : 1800;
          const aElo = teamAway ? teamAway.eloRating : 1800;
          const expectedHome = 1 / (1 + Math.pow(10, (aElo - hElo) / 400));
          const expectedAway = 1 / (1 + Math.pow(10, (hElo - aElo) / 400));
          
          let actualHome = 0.5;
          let actualAway = 0.5;
          if (homeScore > awayScore) {
            actualHome = 1;
            actualAway = 0;
          } else if (awayScore > homeScore) {
            actualHome = 0;
            actualAway = 1;
          }
          
          const hEloDiff = Math.round(K * (actualHome - expectedHome));
          const aEloDiff = Math.round(K * (actualAway - expectedAway));
  
          if (!isMatchAlreadyAdded) {
            newlyPlayedMatches.push({
              id: `search_${mId}`,
              homeTeam: homeTeamName,
              awayTeam: awayTeamName,
              homeFlag: teamHome?.flag || '🏳️',
              awayFlag: teamAway?.flag || '🏳️',
              homeScore: homeScore,
              awayScore: awayScore,
              homeEloDiff: teamHome ? hEloDiff : 0,
              awayEloDiff: teamAway ? aEloDiff : 0,
              scorersSummary: `${rawMatch.competition?.name || 'International Match'}`,
              timestamp: `Live Search FT (${utcDate ? utcDate.substring(0, 10) : 'June 2026'})`,
              sourceVerification: {
                apiEndpoint,
                competitionCode: compCode,
                matchId: mId,
                utcDate
              }
            });
          }
        }
      }
  
      setPlayedMatches(prev => {
        const userMatches = prev.filter(m => !m.id.startsWith('search_'));
        // Double check: validate every newly added match exists in raw response matches
        const validated = newlyPlayedMatches.filter(m => {
          const existsInRaw = (globalFootballData.matches || []).some((lm: any) => String(lm.id) === m.sourceVerification?.matchId);
          if (!existsInRaw) {
            console.warn("Invalid generated match detected. Match absent from Football-Data.org raw list.");
            return false;
          }
          return true;
        });
        return [...validated, ...userMatches];
      });
    }
  }, [globalFootballData]);
 
  // Live Match Ends Feed States
  const [devMode, setDevMode] = useState(false);
  const [playedMatches, setPlayedMatches] = useState<Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeFlag: string;
    awayFlag: string;
    homeScore: number;
    awayScore: number;
    homeEloDiff: number;
    awayEloDiff: number;
    scorersSummary: string;
    timestamp: string;
    sourceVerification?: {
      apiEndpoint: string;
      competitionCode: string;
      matchId: string;
      utcDate: string;
    };
  }>>([]);

  // Debate logs & final consensus states
  const [logs, setLogs] = useState<DebateLog[]>([]);
  const [moderatorReport, setModeratorReport] = useState<ModeratorOutput | null>(null);

  // Dedicated Debate Room flow states
  const [currentScreen, setCurrentScreen] = useState<'selection' | 'debate' | 'report'>('selection');
  const [chatMessages, setChatMessages] = useState<DebateLog[]>([]);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [currentRoundNum, setCurrentRoundNum] = useState<number>(1);

  const streamTimeoutRef = useRef<any>(null);
  const secondaryTimeoutRef = useRef<any>(null);
  const currentLogsListRef = useRef<DebateLog[]>([]);
  const fullFinalReportRef = useRef<ModeratorOutput | null>(null);
  const debateContainerEndRef = useRef<HTMLDivElement | null>(null);
  const hasBootstrappedRef = useRef<boolean>(false);
  const activePredictionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const contendersRef = useRef<Contender[]>(contenders);
  const rosterContendersRef = useRef<Contender[]>(rosterContenders);

  useEffect(() => {
    contendersRef.current = contenders;
  }, [contenders]);

  useEffect(() => {
    rosterContendersRef.current = rosterContenders;
  }, [rosterContenders]);

  // Pre-fetch files & health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mode) {
          setApiMode(data.mode);
        }
      })
      .catch((err) => console.log('Backend connection error (falling back to robust browser-side simulator):', err));

    fetch('/api/project-files')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.files) {
          setProjectFiles(data.files);
        }
      })
      .catch((err) => console.log('Telemetry project path offline, loading internal replica structures.', err));
  }, []);

  // Run initial data sync on load to pre-populate calculations with fresh data
  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    if (footballStore.getData()) return;
    const bootstrap = async () => {
      try {
        await handleSyncLiveData();
      } catch (e) {
        console.warn('Startup sync failed:', e);
      }
    };
    bootstrap();
  }, [apiMode]);

  // Set up auto-scrolling listener whenever chatMessages or typing state changes
  // We migrated this scrolling behaviour directly into DebateRoom container checks to prevent forcing scroll-yanks when the user tries to scroll up and read transcripts.
  useEffect(() => {
    // Only scroll the whole page once initially if needed when entering the debate screen
    if (currentScreen === 'debate' && debateContainerEndRef.current) {
      debateContainerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentScreen]);

  const handleRunCouncilDebate = async (customContenders?: Contender[], silent: boolean = false) => {
    // Client-side duplicate request protection
    if (activePredictionPromiseRef.current) {
      console.log(`Prediction Request ID: ${activeRequestIdRef.current}`);
      console.log("Duplicate request prevented");
      console.log("Promise reused");
      if (!silent) {
        setCurrentScreen('debate');
      }
      return;
    }

    const uuid = "pred-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
    activeRequestIdRef.current = uuid;

    // Create a dummy placeholder promise immediately to lock concurrent clicks synchronously!
    let resolvePlaceholder: any;
    const placeholder = new Promise((resolve) => {
      resolvePlaceholder = resolve;
    });
    activePredictionPromiseRef.current = placeholder;

    console.log(`Prediction Request ID: ${uuid}`);
    console.log("Prediction started");

    // Clear any existing active stream timeouts
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    if (secondaryTimeoutRef.current) clearTimeout(secondaryTimeoutRef.current);

    setIsRunning(true);
    setLogs([]);
    setModeratorReport(null);
    setTypingAgent(null);
    setCurrentRoundNum(1);
    setActiveStep('SEQUENTIAL_DATA');

    if (!silent) {
      setChatMessages([
        {
          id: 'sys-start-init',
          timestamp: new Date().toISOString(),
          stepType: 'SEQUENTIAL_DATA',
          agentName: 'System',
          role: 'Orchestration system',
          title: 'Prediction Council Broadcaster Online',
          message: 'Synchronizing tournament grids and loading analyst node parameters...'
        }
      ]);
      setTypingAgent('Moderator');
      setCurrentScreen('debate'); // Transition to full-screen Debate Room
    } else {
      setChatMessages([]);
    }

    const activeList = Array.isArray(customContenders) ? customContenders : contenders;
    let resLogs: DebateLog[] = [];
    let resReport: ModeratorOutput | null = null;

    // Check if live synchronized football data exists on the client
    const clientStoreData = footballStore.getData();
    const validSynchronizedDataExists = checkAndTraceLiveDataAvailability(activeList, clientStoreData);

    const runDebatePromise = (async () => {
      // The decision should depend ONLY on whether live synchronized football data exists, 
      // not on Vite, localhost, AI Studio preview, development mode, or build mode.
      // Requirement 1 & 3: Force Live AI Prediction Pipeline if synchronized data exists. Never execute offline simulator.
      if (!validSynchronizedDataExists) {
        console.log("Running simulation in local mode. Live data verified as completely unavailable.");
        // Only use Offline Local Simulation when store is empty, sync failed, or cache expired.
        const res = await runSimulation(activeList, DISCUSSION_ROUNDS, true, null, clientStoreData);
        return res;
      } else {
        // Force Live AI Prediction Pipeline
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn('API simulate endpoint took longer than 120 seconds. Aborting and falling back to robust client-side simulator.');
          controller.abort();
        }, 120000);

        try {
          // Compress the synchronized dataset by keeping only teams field used by GPT to prevent payload limits
          const compressedLiveData = clientStoreData ? {
            teams: clientStoreData.teams
          } : null;

          const requestPayload = {
            contenders: activeList,
            rounds: DISCUSSION_ROUNDS,
            liveFootballData: compressedLiveData,
            requestId: uuid
          };

          const serializedPayload = JSON.stringify(requestPayload);
          const payloadBytes = new Blob([serializedPayload]).size;

          console.log(`[CLIENT] Serialized simulation payload size: ${payloadBytes} bytes`);

          // Verify payload size before POST. If payload > 8MB, abort with a readable error.
          if (payloadBytes > 8 * 1024 * 1024) {
            const errorMsg = `Aborting API POST: Payload size of ${(payloadBytes / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed limit of 8.00MB.`;
            console.error(errorMsg);
            throw new Error(errorMsg);
          }

          const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: serializedPayload,
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Local server engine failed, triggering secure fallback router.');
          }

          const res = await response.json();
          return res;

        } catch (err) {
          clearTimeout(timeoutId);
          console.warn('Backend endpoint unreached, timed out, or quota exceeded. Running secure browser-native multi-agent prediction loop instead.', err);
          
          let offlineReason = "Backend endpoint unreached or error occurred during fetch.";
          console.log(`Running simulation in local mode. Offline fallback reason: ${offlineReason}`);
          const res = await runSimulation(activeList, DISCUSSION_ROUNDS, true, null, clientStoreData);
          return res;
        }
      }
    })();

    activePredictionPromiseRef.current = runDebatePromise;
    if (typeof resolvePlaceholder === 'function') {
      resolvePlaceholder(runDebatePromise);
    }

    try {
      const res = await runDebatePromise;
      resLogs = res.logs;
      resReport = res.finalReport;
      console.log(`Prediction Request ID: ${uuid}`);
      console.log("Prediction completed");
    } catch (err) {
      console.error("Prediction loop execution failure:", err);
    } finally {
      activePredictionPromiseRef.current = null;
    }

    currentLogsListRef.current = resLogs;
    fullFinalReportRef.current = resReport;

    if (silent) {
      // Populates instantly without any streaming or transitions
      setLogs(resLogs);
      setChatMessages(resLogs);
      setModeratorReport(resReport);
      setIsRunning(false);
      setActiveStep('COMPLETED');
      setCurrentRoundNum(5);
    } else {
      // Begin sequential chat streaming!
      playChatStream(0);
    }
  };

  const playChatStream = (index: number) => {
    const allLogs = currentLogsListRef.current;
    if (index >= allLogs.length) {
      // Reached final consensus report
      setModeratorReport(fullFinalReportRef.current);
      setIsRunning(false);
      setActiveStep('COMPLETED');
      setCurrentRoundNum(5);
      return;
    }

    const logItem = allLogs[index];

    // Map stages to Round Numbers (1 to 5)
    if (logItem.stepType === 'SEQUENTIAL_DATA' || logItem.stepType === 'PARALLEL_ANALYSIS') {
      setCurrentRoundNum(1);
    } else if (logItem.stepType === 'DEBATE_LOOP_1') {
      setCurrentRoundNum(2);
    } else if (logItem.stepType === 'DEBATE_LOOP_2') {
      setCurrentRoundNum(3);
    } else if (logItem.stepType === 'HEIRARCHICAL_MODERATION') {
      setCurrentRoundNum(4);
    } else if (logItem.stepType === 'COMPLETED') {
      setCurrentRoundNum(5);
    }

    setActiveStep(logItem.stepType);

    if (logItem.agentName === 'System') {
      // System message: skip typing indicators
      setTypingAgent(null);
      setChatMessages(prev => [...prev, logItem]);
      setLogs(prev => [...prev, logItem]);
      
      streamTimeoutRef.current = setTimeout(() => {
        playChatStream(index + 1);
      }, 150);
    } else {
      // Regular agent message: simulate fast, snappy typing feedback
      setTypingAgent(logItem.agentName);
      
      const baseDelay = 300;
      const lengthCoeff = Math.min(350, logItem.message.length * 0.8);
      const totalDelay = baseDelay + lengthCoeff + (Math.random() * 50);

      streamTimeoutRef.current = setTimeout(() => {
        setTypingAgent(null);
        setChatMessages(prev => [...prev, logItem]);
        setLogs(prev => [...prev, logItem]);
        
        // Short pause between messages
        secondaryTimeoutRef.current = setTimeout(() => {
          playChatStream(index + 1);
        }, 250);
      }, totalDelay);
    }
  };

  const handleSkipDebate = () => {
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    if (secondaryTimeoutRef.current) clearTimeout(secondaryTimeoutRef.current);
    
    setTypingAgent(null);
    setChatMessages(currentLogsListRef.current);
    setLogs(currentLogsListRef.current);
    setModeratorReport(fullFinalReportRef.current);
    setIsRunning(false);
    setActiveStep('COMPLETED');
    setCurrentRoundNum(5);
    setCurrentScreen('report'); // Directly jump to report page
  };

  const handleRestart = () => {
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    if (secondaryTimeoutRef.current) clearTimeout(secondaryTimeoutRef.current);
    setTypingAgent(null);
    setIsRunning(false);
    setCurrentRoundNum(1);
    setCurrentScreen('selection');
  };

  const handleSyncLiveData = async (options: { silent?: boolean } = {}): Promise<Contender[]> => {
    const { silent = false } = options;
    const activeContenders = contendersRef.current;
    const activeRosterContenders = rosterContendersRef.current;

    setIsSyncing(true);
    setSyncStatus('🛰️ Establishing live crawler connection to Football-Data.org...');
    if (!silent) {
      setLogs(prev => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          stepType: 'SEQUENTIAL_DATA',
          agentName: 'System',
          role: 'Orchestrator',
          title: 'Football-Data.org Live Sync Engaged',
          message: 'Requesting verified FIFA stats and recent results from Football-Data.org...'
        },
        ...prev
      ]);
    }
    
    try {
      const result = await footballStore.sync(activeContenders, setSyncStatus);
      
      const currentContenders = applyLiveDataToContenders(activeContenders, result);
      
      setRosterContenders(() => {
        return activeRosterContenders.map(c => {
          const found = currentContenders.find(cc => cc.name.toLowerCase() === c.name.toLowerCase());
          return found || c;
        });
      });
      setContenders(currentContenders);

      if (!silent) {
        setLogs(prev => [
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            stepType: 'SEQUENTIAL_DATA',
            agentName: 'Stats Agent',
            role: 'Statistics Agent',
            title: 'Football-Data.org Stats Vetted & Integrated',
            message: `Dynamic Sync pipeline fetched rankings and key match endings successfully from: ${result.source || 'Football-Data.org'}.`
          },
          ...prev
        ]);
      }
      
      setSyncStatus('✅ Football-Data.org synchronization completed successfully!');
      setTimeout(() => setSyncStatus(''), 5500);

      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const formattedDate = now.toLocaleDateString();
      setLastRefreshed(`${formattedDate} ${formattedTime}`);

      return currentContenders;

    } catch (err: any) {
      console.warn('Backend search API error:', err);
      setSyncStatus('⚠️ Crawler issue, applying official June 2026 local coefficients instead.');
      
      const updatedRoster = activeRosterContenders.map(c => {
        if (c.name === 'Argentina') return { ...c, eloRating: 2150, fifaRanking: 1, recentForm: 'W W W D W' };
        if (c.name === 'France') return { ...c, eloRating: 2110, fifaRanking: 3, recentForm: 'W D W D W' };
        if (c.name === 'Spain') return { ...c, eloRating: 2125, fifaRanking: 2, recentForm: 'W W W W D' };
        if (c.name === 'England') return { ...c, eloRating: 2010, fifaRanking: 4, recentForm: 'W D L W W' };
        if (c.name === 'Portugal') return { ...c, eloRating: 2015, fifaRanking: 5, recentForm: 'W W L W W' };
        if (c.name === 'Brazil') return { ...c, eloRating: 2045, fifaRanking: 6, recentForm: 'W L W D W' };
        if (c.name === 'Germany') return { ...c, eloRating: 2005, fifaRanking: 10, recentForm: 'W D W L L' };
        if (c.name === 'Colombia') return { ...c, eloRating: 2030, fifaRanking: 13, recentForm: 'W W D W W' };
        return c;
      });
      setRosterContenders(updatedRoster);

      const updated = activeContenders.map(c => {
        const found = updatedRoster.find(r => r.name.toLowerCase() === c.name.toLowerCase());
        return found || c;
      });
      setContenders(updated);
      
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const formattedDate = now.toLocaleDateString();
      setLastRefreshed(`${formattedDate} ${formattedTime}`);

      setTimeout(() => setSyncStatus(''), 5500);
      return updated;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAddTeam = (teamData: any) => {
    // If team is already on list, alert
    if (contenders.find(c => c.name.toLowerCase() === teamData.name.toLowerCase())) {
      alert(`${teamData.name} is already registered in the active contenders list.`);
      return;
    }
    const newTeam: Contender = {
      id: teamData.id || Math.random().toString(36).substring(2, 9),
      name: teamData.name,
      flag: teamData.flag,
      fifaRanking: teamData.fifaRanking,
      eloRating: teamData.eloRating,
      coach: teamData.coach,
      keyPlayers: teamData.keyPlayers,
      recentForm: teamData.recentForm,
      goalsScoredLast10: teamData.goalsScoredLast10,
      goalsConcededLast10: teamData.goalsConcededLast10,
      primaryColor: teamData.primaryColor || '#a855f7'
    };
    setContenders([...contenders, newTeam]);
  };

  const handleAddContender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newContender: Contender = {
      id: Math.random().toString(36).substring(2, 9),
      name: newTeamName,
      flag: newTeamFlag,
      fifaRanking: Number(newFifaRank),
      eloRating: Number(newElo),
      coach: newCoach || 'Strategic Planner',
      keyPlayers: newStars ? newStars.split(',').map(s => s.trim()) : ['Star Catalyst'],
      recentForm: newForm,
      goalsScoredLast10: Number(newGs),
      goalsConcededLast10: Number(newGc),
      primaryColor: '#a855f7'
    };

    setContenders([...contenders, newContender]);
    
    // Clear form
    setNewTeamName('');
    setNewTeamFlag('🏳️');
    setNewCoach('');
    setNewStars('');
  };

  const handleRemoveContender = (id: string) => {
    if (contenders.length <= 2) {
      alert("The council requires at least 2 active competitors for tournament matching analysis.");
      return;
    }
    setContenders(contenders.filter(c => c.id !== id));
  };

  const handleResetDefault = () => {
    setContenders(INITIAL_CONTENDERS);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedFile(true);
    setTimeout(() => setHasCopiedFile(false), 2000);
  };

  // Helper colors for specialists
  const getAgentColor = (name: string) => {
    switch (name) {
      case 'Stats Analyst': return 'border-indigo-500 text-indigo-400';
      case 'Squad Scout': return 'border-blue-500 text-blue-400';
      case 'Tactical Analyst': return 'border-purple-500 text-purple-400';
      case 'History Analyst': return 'border-amber-500 text-amber-500';
      case 'Risk Analyst': return 'border-red-500 text-red-400';
      case 'Moderator': return 'border-emerald-500 text-emerald-400';
      default: return 'border-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* HEADER SECTION - Minimalist Editorial */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-5 pt-6 px-8 bg-zinc-950 gap-4">
        <div className="flex items-center gap-4">
          <FifaTrophyLogo className="w-10 h-10 shrink-0" />
          <div className="flex flex-col">
            <span className="text-zinc-550 text-[10px] uppercase tracking-widest font-mono">
              Collaborative Sports Intelligence
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              Football Prediction Council
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[9px] uppercase font-mono tracking-widest leading-none">Simulation Status</span>
            <span className="text-zinc-300 text-xs font-medium font-mono mt-1">
              {isRunning ? 'Analyzing Debates' : 'Predictions Ready'}
            </span>
          </div>

          <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'simulation' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Interactive Board
            </button>
            <button
              onClick={() => setActiveTab('instructions_tab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'instructions_tab' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              How it Works
            </button>
          </div>
        </div>
      </header>

      {/* FILTER PANEL (Elegant and Simple layout, strictly human labels) */}
      <div className="bg-zinc-900/60 border-b border-zinc-800 px-8 py-3 text-xs flex flex-col sm:flex-row justify-between sm:items-center font-mono text-zinc-400 gap-2">
        <div className="flex items-center gap-4">
          <span>
            Mode: <strong className="text-zinc-200 font-semibold">{apiMode === 'live-ai' ? 'Live Consensus Model' : 'Preset Analytical Profile'}</strong>
          </span>
          <span className="h-4 w-px bg-zinc-800 hidden sm:inline-block"></span>
          <span>
            Registered Contenders: <strong className="text-zinc-200 font-semibold">{contenders.length}</strong>
          </span>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-8 bg-zinc-900/10">
        
        {/* TABS 1: MAIN BENTO SIMULATOR INTERACTIVE */}
        {activeTab === 'simulation' && currentScreen === 'selection' && (
          <div className="space-y-6">
            
            {/* INLINE PARAMETERS/CONTENDER CONFIGURATION */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-bold uppercase tracking-tight text-white font-display flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" /> Active Contenders Board
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Select and configure the specific nations to run through our collaborative multi-agent discussion.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleResetDefault}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-705 text-xs font-mono text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer inline-flex items-center gap-1.5"
                    title="Reset list of active contestants back to standard giants"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Teams
                  </button>
                  <button 
                    type="button"
                    disabled={isRunning}
                    onClick={() => handleRunCouncilDebate()}
                    className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all border border-indigo-400 cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/35"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> {isRunning ? 'Running Analysis...' : 'Kickoff Debate'}
                  </button>
                </div>
              </div>

              {/* Active Contenders horizontal cards */}
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-3 font-semibold">
                  Registered Panels ({contenders.length} active)
                </span>
                
                <div className="flex flex-wrap gap-2.5">
                  {contenders.map((team) => (
                    <div 
                      key={team.id}
                      className="bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-4 text-xs transition-colors hover:border-zinc-700 shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        {getCountryFlag(team.name, team.flag || '🏳️', "w-5 h-3.5")}
                        <div>
                          <strong className="text-zinc-100 text-sm font-semibold">{team.name}</strong>
                          <div className="text-[10px] text-zinc-500 font-medium font-mono flex items-center gap-1.5 mt-0.5">
                            <span>Rank #{team.fifaRanking}</span>
                            <span>•</span>
                            <span className="text-zinc-400">Elo {team.eloRating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
                        <div className="hidden sm:block">
                          {renderFormBadges(team.recentForm)}
                        </div>

                        <button 
                          onClick={() => handleRemoveContender(team.id)}
                          className="text-zinc-500 hover:text-rose-450 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Remove team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE SYNC STATUS & CONTROLS */}
              <div className="bg-zinc-900/60 rounded-xl p-5 mb-6 border border-zinc-800 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      <strong className="text-xs uppercase tracking-wider font-mono text-zinc-200 font-bold">
                        Rankings & Elo Synchronization
                      </strong>
                    </div>
                    <p className="text-zinc-400 text-xs">
                      Fetches contemporary sports metrics and matches metadata automatically, then keeps refreshing while this tab stays open.
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Auto-refresh interval: 5 minutes.
                    </p>
                    {lastRefreshed && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 mt-1 uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Data Last Refreshed: {lastRefreshed}</span>
                      </div>
                    )}
                    {syncStatus && (
                      <p className="text-zinc-350 font-mono text-xs mt-1">{syncStatus}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncLiveData}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-[11px] font-mono text-zinc-200 rounded-lg transition-all border border-zinc-700 font-medium cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center"
                  >
                    {isSyncing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                        <span>Football data is already synchronizing...</span>
                      </>
                    ) : (
                      'Search Sync'
                    )}
                  </button>
                </div>

                {/* Display dynamic search summaries if populated */}
                {searchNewsSummary && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-xs text-zinc-300 space-y-1">
                    <h5 className="font-semibold text-zinc-400 text-[10px] uppercase tracking-wider font-mono">Live Search Bulletin:</h5>
                    <p className="leading-relaxed italic text-zinc-400">"{searchNewsSummary}"</p>
                  </div>
                )}

                {/* Grounded Sources & Citations list */}
                {searchCitations && searchCitations.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-xs space-y-2">
                    <h5 className="font-semibold text-zinc-400 text-[10px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></span>
                      Grounded Sources & Citations ({searchCitations.length}):
                    </h5>
                    <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {searchCitations.map((citation: any, idx) => (
                        <a
                          key={idx}
                          href={citation.url || citation.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white rounded-md text-[10px] font-mono transition-all flex items-center gap-1.5 shadow-sm truncate max-w-[280px]"
                          title={citation.title}
                        >
                          <span className="font-semibold text-emerald-400">[{citation.source || 'Web'}]</span>
                          <span className="truncate">{citation.title}</span>
                          {citation.retrievedAt && (
                            <span className="text-[8px] text-zinc-600 font-normal">
                              ({new Date(citation.retrievedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synced Live Matches feed history */}
                {playedMatches.length > 0 ? (
                  <div className="mt-2 pt-4 border-t border-zinc-800/80 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-zinc-450"></span>
                      Retrieved Recent Matches
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {playedMatches.map(match => (
                        <div key={match.id} className="bg-zinc-950 rounded-lg px-4 py-3 border border-zinc-800 flex flex-col justify-between text-[11px] gap-1.5 shadow-sm">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="font-semibold flex items-center gap-1.5">
                              {match.homeFlag} {match.homeTeam} <span className="font-mono text-zinc-400 font-bold mx-0.5">{match.homeScore}</span>
                              <span className="text-zinc-650 font-mono">-</span>
                              <span className="font-mono text-zinc-400 font-bold mx-0.5">{match.awayScore}</span> {match.awayFlag} {match.awayTeam}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">FT</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 italic leading-snug">
                            {match.scorersSummary}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 border-t border-zinc-800/80 pt-1.5 mt-1">
                            <span>Elo Shift: {match.homeEloDiff >= 0 ? '+' : ''}{match.homeEloDiff} / {match.awayEloDiff >= 0 ? '+' : ''}{match.awayEloDiff}</span>
                            <span>{match.timestamp}</span>
                          </div>

                          {/* Source Verification Box */}
                          {match.sourceVerification && (
                            <div className="mt-2 pt-1.5 border-t border-zinc-800/50 text-[9px] font-mono text-zinc-500 bg-zinc-900/30 p-1.5 rounded flex flex-col gap-1">
                              <div className="text-emerald-500 font-bold uppercase text-[8px] tracking-wider">✓ Verified Football-Data.org Source</div>
                              <div className="flex justify-between">
                                <div><span className="text-zinc-400">Comp:</span> {match.sourceVerification.competitionCode}</div>
                                <div><span className="text-zinc-400">ID:</span> {match.sourceVerification.matchId}</div>
                              </div>
                              <div><span className="text-zinc-400">UTC Date:</span> {match.sourceVerification.utcDate}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-4 border-t border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-zinc-450"></span>
                      Retrieved Recent Matches
                    </span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-center text-xs text-zinc-500 font-mono">
                      No live data available.
                    </div>
                  </div>
                )}

                {/* Developer Mode Toggle & Raw JSON View */}
                <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                      Diagnostic Tools
                    </span>
                    <button
                      type="button"
                      onClick={() => setDevMode(!devMode)}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-[9px] font-mono text-zinc-400 hover:text-white rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {devMode ? 'Hide' : 'Show'} Raw Football-Data.org JSON
                    </button>
                  </div>

                  {devMode && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1.5">
                        <span>DATA SOURCE: Football-Data.org Direct API v4</span>
                        <span>STATUS: Verified</span>
                      </div>
                      <pre className="text-[10px] font-mono text-zinc-450 bg-zinc-900/50 p-2.5 rounded border border-zinc-855 overflow-x-auto max-h-[250px] overflow-y-auto">
                        {globalFootballData?.rawJson || JSON.stringify(globalFootballData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* 48-NATION ROSTER CATALOG */}
              <div className="border-t border-zinc-800 pt-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div>
                    <h5 className="text-[13px] uppercase font-mono tracking-wider text-zinc-300 font-bold">
                      National Teams Database
                    </h5>
                    <p className="text-zinc-400 text-xs mt-1">
                      Explore and register qualified nations into the active discussion council.
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-2.5 max-w-full sm:max-w-md w-full">
                    <input 
                      type="text"
                      placeholder="Search country or keys..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 font-semibold flex-1"
                    />
                  </div>
                </div>

                {/* Confederation Selection Tabs */}
                <div className="flex flex-wrap gap-1.5 mb-5 border-b border-zinc-805 pb-3">
                  {[
                    { id: 'ALL', name: 'All Regions' },
                    { id: 'UEFA', name: 'Europe' },
                    { id: 'CONMEBOL', name: 'South America' },
                    { id: 'CONCACAF', name: 'North America' },
                    { id: 'CAF', name: 'Africa' },
                    { id: 'AFC/OFC', name: 'Asia / Oceania' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedConfed(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide font-medium uppercase transition-all cursor-pointer ${
                        selectedConfed === tab.id 
                          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                          : 'bg-zinc-950/60 text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-zinc-900/60'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>

                {/* Grid Roster list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto pr-1">
                  {rosterContenders.filter(team => {
                    const matchesSearch = team.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                                          team.keyPlayers.some(p => p.toLowerCase().includes(catalogSearch.toLowerCase())) ||
                                          team.coach.toLowerCase().includes(catalogSearch.toLowerCase());
                    const matchesConfed = selectedConfed === 'ALL' || getConfederation(team) === selectedConfed;
                    return matchesSearch && matchesConfed;
                  }).map(team => {
                    const isRegistered = contenders.some(c => c.id === team.id || c.name.toLowerCase() === team.name.toLowerCase());
                    return (
                      <div 
                        key={team.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                          isRegistered 
                            ? 'bg-zinc-900/80 border-zinc-700' 
                            : 'bg-zinc-950 border-zinc-808 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getCountryFlag(team.name, team.flag || '🏳️', "w-5 h-3.5")}
                            <div>
                              <strong className="text-zinc-100 font-semibold block">{team.name}</strong>
                              <span className="text-[10px] text-zinc-550 font-mono uppercase">{getConfederation(team)}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            team.fifaRanking < 10 
                              ? 'bg-zinc-850 text-zinc-300 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-400 border border-transparent'
                          }`}>
                            FIFA #{team.fifaRanking}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-zinc-400">
                            <span>Elo Coefficient</span>
                            <span className="text-zinc-300 font-mono font-bold">{team.eloRating}</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-450">
                            <span>Recent Form</span>
                            {renderFormBadges(team.recentForm)}
                          </div>
                          <div className="text-[10px] text-zinc-400 border-t border-zinc-950 pt-2 mt-1 truncate">
                            <span className="text-zinc-500 font-mono">Squad stars:</span> {team.keyPlayers.join(', ')}
                          </div>
                        </div>

                        {isRegistered ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveContender(team.id)}
                            className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-705 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            Remove Team
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSyncAddTeam(team)}
                            className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-700 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                          >
                            Add to Board
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADVANCED CUSTOM TEAM CREATION ACCORDION */}
              <div className="border-t border-zinc-800/80 pt-4 mt-6">
                <details className="group">
                  <summary className="text-[11px] uppercase font-mono tracking-wider text-zinc-500 font-bold cursor-pointer hover:text-zinc-300 select-none flex items-center justify-between">
                    <span>Add Custom Contender Profile (Advanced)</span>
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  
                  <form onSubmit={handleAddContender} className="grid grid-cols-2 lg:grid-cols-10 gap-4 pt-4 mt-2">
                    <div className="col-span-2 lg:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">Team Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dream Team"
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-zinc-700 font-semibold"
                      />
                    </div>
                    
                    <div className="col-span-1 lg:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">Flag</label>
                      <select
                        value={newTeamFlag}
                        onChange={(e) => setNewTeamFlag(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 font-mono cursor-pointer"
                      >
                        <option value="🏳️">🏳️ Generic</option>
                        <option value="🇩🇪">🇩🇪 GER</option>
                        <option value="🇵🇹">🇵🇹 POR</option>
                        <option value="🇮🇹">🇮🇹 ITA</option>
                        <option value="🇳🇱">🇳🇱 NED</option>
                        <option value="🇭🇷">🇭🇷 CRO</option>
                        <option value="🇧🇪">🇧🇪 BEL</option>
                        <option value="🇺🇾">🇺🇾 URU</option>
                        <option value="🇺🇸">🇺🇸 USA</option>
                        <option value="🇲🇽">🇲🇽 MEX</option>
                        <option value="🇯🇵">🇯🇵 JPN</option>
                        <option value="🇸🇳">🇸🇳 SEN</option>
                        <option value="🇲🇦">🇲🇦 MAR</option>
                        <option value="🇨🇭">🇨🇭 SUI</option>
                      </select>
                    </div>

                    <div className="col-span-1 lg:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">FIFA Rank</label>
                      <input 
                        type="number" 
                        value={newFifaRank}
                        onChange={(e) => setNewFifaRank(Number(e.target.value))}
                        min={1} max={150}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 font-mono"
                      />
                    </div>
                    
                    <div className="col-span-1 lg:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">Elo Rating</label>
                      <input 
                        type="number" 
                        value={newElo}
                        onChange={(e) => setNewElo(Number(e.target.value))}
                        min={1000} max={2500}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 font-mono"
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-2">
                       <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">Head Coach</label>
                       <input 
                        type="text" 
                        placeholder="e.g. Mastermind"
                        value={newCoach}
                        onChange={(e) => setNewCoach(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all rounded-lg border border-zinc-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Team
                      </button>
                    </div>
                  </form>
                </details>
              </div>
            </div>

            {/* BIG KICKOFF TRIGGER ACCENT */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden mt-6">
              <div className="mb-4 h-12 w-12 flex items-center justify-center">
                <FifaTrophyLogo className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white mb-2">
                Predictive Consensus Engine
              </h3>
              <p className="text-zinc-400 text-xs max-w-lg mb-6 leading-relaxed">
                Execute a systematic prediction debate between specialized analytical agents. They will evaluate recent live parameters and run through structural discussion rounds to formulate predictions.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  id="btn-kickoff-massive"
                  onClick={() => handleRunCouncilDebate()}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all border border-indigo-750 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  Start Prediction Debate
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'simulation' && currentScreen === 'debate' && (
          <div className="space-y-6">
            <DebateRoom 
              chatMessages={chatMessages}
              typingAgent={typingAgent}
              currentRoundNum={currentRoundNum}
              isRunning={isRunning}
              contenders={contenders}
              handleSkipDebate={handleSkipDebate}
              handleRestart={handleRestart}
              setCurrentScreen={setCurrentScreen}
              getCountryFlag={getCountryFlag}
              moderatorReport={moderatorReport}
              debateContainerEndRef={debateContainerEndRef}
            />
          </div>
        )}

        {activeTab === 'simulation' && currentScreen === 'report' && (
          <div className="space-y-6">
            <ConsensusReport 
              moderatorReport={moderatorReport}
              contenders={contenders}
              getCountryFlag={getCountryFlag}
              setCurrentScreen={setCurrentScreen}
              chatMessages={chatMessages}
            />
          </div>
        )}



        {/* TABS 3: ARCHITECTURE GUIDE */}
        {activeTab === 'instructions_tab' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
              <h3 className="text-base font-bold font-display uppercase tracking-tight text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Football Prediction Panel Setup
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                The **Football Prediction Panel** brings together virtual specialist analysts to share predictions, challenge assumptions, and form a coordinated final prediction report.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center border border-indigo-550/10 font-bold font-mono">1</div>
                  <div>
                    <strong className="text-sm text-slate-200 font-bold block">Statistics Analyst</strong>
                    <span className="text-xs text-slate-400 leading-relaxed">Evaluates Elo coefficients, objective FIFA metrics, goals scored, and recent team results.</span>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center border border-blue-550/10 font-bold font-mono">2</div>
                  <div>
                    <strong className="text-sm text-slate-200 font-bold block">Squad Scout</strong>
                    <span className="text-xs text-slate-400 leading-relaxed">Investigates roster depth, playmakers, fitness reports, and recent team injuries.</span>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center border border-purple-550/10 font-bold font-mono">3</div>
                  <div>
                    <strong className="text-sm text-slate-200 font-bold block">Tactical Analyst</strong>
                    <span className="text-xs text-slate-400 leading-relaxed">Maps tactical formations, pressing models, coaching styles, and on-pitch organization.</span>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-950 p-4 rounded-xl border border-slate-855">
                  <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center border border-red-550/10 font-bold font-mono">4</div>
                  <div>
                    <strong className="text-sm text-slate-200 font-bold block">Risk Analyst</strong>
                    <span className="text-xs text-slate-400 leading-relaxed font-semibold">Flags squad limitations, difficult tournament brackets, defensive gaps, and fatigue.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-display uppercase tracking-tight text-white mb-4">
                  Why Use a Collaborative Analyst Panel?
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Instead of relying on a single general model, separating viewpoints into specialized roles creates more realistic, detailed, and human-like sports forecasting:
                </p>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <strong className="text-indigo-400 font-bold block">📂 Real Team Profiles</strong>
                    <span className="text-slate-400">Gathers recent results, FIFA stats, and Elo coefficients into an objective team overview.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <strong className="text-blue-400 font-bold block">🔍 Specialist Perspectives</strong>
                    <span className="text-slate-400">Examines different sides of the game (Tactics, History, Statistics, Squads) to build solid predictions.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <strong className="text-purple-400 font-bold block">💬 Direct Critiques & Debates</strong>
                    <span className="text-slate-400">Analysts challenge each other's opinions, exposing defensive gaps or depth issues.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <strong className="text-emerald-400 font-bold block">🏆 Consolidated Forecast</strong>
                    <span className="text-slate-400">Combines all views to form a final prediction report and team-by-team winning probabilities.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                  Collaborative Analyst Debate Panel 
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-8 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
        World Cup Prediction Council 
      </footer>
    </div>
  );
}
