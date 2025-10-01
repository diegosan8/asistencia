
import React from 'react';
import type { Player } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface RosterTableProps {
    players: Player[];
    onPlayerChange: (id: string, field: keyof Omit<Player, 'id'>, value: string) => void;
    onAddPlayer: () => void;
    onRemovePlayer: (id:string) => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({ players, onPlayerChange, onAddPlayer, onRemovePlayer }) => {
    
    const handleInputChange = (id: string, field: keyof Omit<Player, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
        onPlayerChange(id, field, e.target.value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                    <tr>
                        <th scope="col" className="px-4 py-3 w-16">N° Camiseta</th>
                        <th scope="col" className="px-4 py-3">Nombre y Apellido</th>
                        <th scope="col" className="px-4 py-3">DNI</th>
                        <th scope="col" className="px-4 py-3">Fecha Nacimiento</th>
                        <th scope="col" className="px-4 py-3 text-center w-20">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) => (
                        <tr key={player.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-4 py-2">
                                <input type="text" value={player.jersey} onChange={(e) => handleInputChange(player.id, 'jersey', e)} className="w-full bg-transparent border-none focus:ring-0 p-1"/>
                            </td>
                            <td className="px-4 py-2">
                                <input type="text" value={player.name} onChange={(e) => handleInputChange(player.id, 'name', e)} className="w-full bg-transparent border-none focus:ring-0 p-1"/>
                            </td>
                            <td className="px-4 py-2">
                                <input type="text" value={player.dni} onChange={(e) => handleInputChange(player.id, 'dni', e)} className="w-full bg-transparent border-none focus:ring-0 p-1"/>
                            </td>
                            <td className="px-4 py-2">
                                <input type="date" value={player.birthDate} onChange={(e) => handleInputChange(player.id, 'birthDate', e)} className="w-full bg-transparent border-none focus:ring-0 p-1"/>
                            </td>
                            <td className="px-4 py-2 text-center">
                                <button onClick={() => onRemovePlayer(player.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-start">
                <button onClick={onAddPlayer} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition">
                    <PlusIcon />
                    Agregar Deportista
                </button>
            </div>
        </div>
    );
};
