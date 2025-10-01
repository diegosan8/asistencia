
import React, { useState, useCallback } from 'react';
import { RosterTable } from './components/RosterTable';
import { DaySelector } from './components/DaySelector';
import { generateAttendanceWorkbook } from './services/excelGenerator';
import type { Player, DayOfWeekIndex } from './types';
import { CalendarIcon, DownloadIcon, TeamIcon } from './components/icons';

const initialPlayers: Player[] = [];

const App: React.FC = () => {
    const [teamName, setTeamName] = useState<string>('Mayores CAB');
    const [year, setYear] = useState<number>(new Date().getFullYear() + 1);
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [selectedDays, setSelectedDays] = useState<Set<DayOfWeekIndex>>(new Set([1, 3])); // Lunes, Miércoles
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePlayerChange = useCallback((id: string, field: keyof Omit<Player, 'id'>, value: string) => {
        setPlayers(currentPlayers =>
            currentPlayers.map(p => (p.id === id ? { ...p, [field]: value } : p))
        );
    }, []);

    const addPlayer = useCallback(() => {
        setPlayers(currentPlayers => [
            ...currentPlayers,
            { id: Date.now().toString(), jersey: '', name: '', dni: '', birthDate: '' }
        ]);
    }, []);

    const removePlayer = useCallback((id: string) => {
        setPlayers(currentPlayers => currentPlayers.filter(p => p.id !== id));
    }, []);

    const toggleDay = useCallback((dayIndex: DayOfWeekIndex) => {
        setSelectedDays(currentDays => {
            const newDays = new Set(currentDays);
            if (newDays.has(dayIndex)) {
                newDays.delete(dayIndex);
            } else {
                newDays.add(dayIndex);
            }
            return newDays;
        });
    }, []);

    const handleGenerate = () => {
        if (players.length === 0) {
            alert("Por favor, agregue al menos un deportista a la lista.");
            return;
        }
        if (selectedDays.size === 0) {
            alert("Por favor, seleccione al menos un día de entrenamiento.");
            return;
        }

        setIsLoading(true);
        // Use a short timeout to allow the UI to update to the loading state
        setTimeout(() => {
            try {
                generateAttendanceWorkbook({ teamName, year, players, selectedDays });
            } catch (error) {
                console.error("Failed to generate workbook", error);
                alert("Hubo un error al generar el archivo Excel. Revise la consola para más detalles.");
            } finally {
                setIsLoading(false);
            }
        }, 50);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white">Generador de Plantillas de Asistencia</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Crea y exporta hojas de asistencia personalizadas para tu equipo.</p>
                </header>

                <main className="space-y-8">
                    {/* Step 1: Configuration */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-700 dark:text-gray-200">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full h-8 w-8 text-sm font-bold flex items-center justify-center mr-3">1</span>
                            Configuración General
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="teamName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre del Equipo</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <TeamIcon />
                                    </div>
                                    <input
                                        type="text"
                                        id="teamName"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Ej: Mayores CAB"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Año</label>
                                 <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                       <CalendarIcon />
                                    </div>
                                    <input
                                        type="number"
                                        id="year"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value, 10))}
                                        className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Días de Entrenamiento</label>
                                <DaySelector selectedDays={selectedDays} onToggleDay={toggleDay} />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Roster */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-700 dark:text-gray-200">
                             <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full h-8 w-8 text-sm font-bold flex items-center justify-center mr-3">2</span>
                            Lista de Deportistas
                        </h2>
                        <RosterTable
                            players={players}
                            onPlayerChange={handlePlayerChange}
                            onAddPlayer={addPlayer}
                            onRemovePlayer={removePlayer}
                        />
                    </div>
                    
                    {/* Step 3: Generate */}
                    <div className="text-center pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 w-full sm:w-auto mx-auto text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg px-8 py-4 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon />
                                    Generar Plantilla para Google Sheets
                                </>
                            )}
                        </button>
                         <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Se descargará un archivo Excel (.xlsx) optimizado para Google Sheets.
                            <br />
                            Súbelo a tu <a href="https://drive.google.com/drive/my-drive" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Drive</a> para habilitar casillas de verificación y formatos de colores.
                            Las instrucciones detalladas se encuentran en la primera hoja del archivo generado.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;