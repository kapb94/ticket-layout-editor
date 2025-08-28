import React from 'react';
import { 
  X, 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Info 
} from 'lucide-react';
import { TicketElement, TableColumn } from '../types';

interface TablePropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  draggedColumnIndex: number | null;
  isDraggingColumn: boolean;
  handleColumnDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleColumnDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleColumnDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleColumnDragEnd: () => void;
}

const TableProperties: React.FC<TablePropertiesProps> = ({
  element,
  updateElement,
  draggedColumnIndex,
  isDraggingColumn,
  handleColumnDragStart,
  handleColumnDragOver,
  handleColumnDrop,
  handleColumnDragEnd
}) => {
  return (
    <>
    {element.type === 'table' && (
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Ruta de datos (ej: productos.items)
            </label>
            <input
                type="text"
                value={element.config?.dataPath || ''}
                onChange={(e) => updateElement({ 
                config: { 
                    ...element.config, 
                    dataPath: e.target.value 
                } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="productos.items"
            />
            <div className="text-xs text-gray-500 mt-2">
                Ejemplo: productos.items, venta.detalles, etc.
            </div>
            {element.config?.dataPath && (
                <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Ruta configurada: {element.config.dataPath}
                </div>
            )}
            </div>

            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Tamaño de fuente de tabla
            </label>
            <div className="flex items-center gap-3">
                <input
                type="range"
                min="8"
                max="20"
                value={element.config?.fontSize || 12}
                onChange={(e) => updateElement({ 
                    config: { 
                    ...element.config, 
                    fontSize: Number(e.target.value) 
                    } 
                })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-700 w-12 text-center font-medium">
                {element.config?.fontSize || 12}px
                </span>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Mostrar bordes
            </label>
            <div className="flex items-center gap-4">
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableBorders"
                    checked={element.config?.showBorders !== false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showBorders: true 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sí</span>
                </label>
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableBorders"
                    checked={element.config?.showBorders === false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showBorders: false 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">No</span>
                </label>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Mostrar encabezado
            </label>
            <div className="flex items-center gap-4">
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableHeader"
                    checked={element.config?.showHeader !== false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showHeader: true 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sí</span>
                </label>
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableHeader"
                    checked={element.config?.showHeader === false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showHeader: false 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">No</span>
                </label>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Fondo del encabezado
            </label>
            <div className="flex items-center gap-4">
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableHeaderBackground"
                    checked={element.config?.showHeaderBackground !== false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showHeaderBackground: true 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Con fondo gris</span>
                </label>
                <label className="flex items-center">
                <input
                    type="radio"
                    name="tableHeaderBackground"
                    checked={element.config?.showHeaderBackground === false}
                    onChange={() => updateElement({ 
                    config: { 
                        ...element.config, 
                        showHeaderBackground: false 
                    } 
                    })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sin fondo</span>
                </label>
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Columnas
            </label>
            <div className="text-sm text-blue-600 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Info size={16} />
                <strong>Consejo:</strong> Puedes reordenar las columnas arrastrándolas o usando los botones ↑↓
            </div>
            {element.config?.columns?.length > 0 && (
                <div className="text-sm text-green-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {element.config.columns.length} columna(s) configurada(s)
                </div>
            )}
            
            {/* Información de depuración */}
            {element.config?.dataPath && element.config?.columns?.length > 0 && (
                <div className="text-sm text-blue-600 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium mb-1">Ruta de datos: {element.config.dataPath}</div>
                <div className="font-medium mb-1">Columnas:</div>
                <ul className="ml-3 mt-1 space-y-1">
                    {element.config.columns.map((col: TableColumn, index: number) => (
                    <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        {col.header} → {col.property}
                    </li>
                    ))}
                </ul>
                <div className="mt-2 text-gray-600 flex items-center gap-2">
                    <Info size={14} />
                    Revisa la consola para ver los datos cargados
                </div>
                </div>
            )}
            {(element.config?.columns || []).map((column: TableColumn, index: number) => (
                <div 
                key={index} 
                className={`space-y-3 mb-4 p-4 border rounded-lg transition-all duration-200 ${
                    draggedColumnIndex === index 
                    ? 'border-blue-500 bg-blue-50 shadow-lg opacity-50' 
                    : isDraggingColumn && draggedColumnIndex !== index
                    ? 'border-dashed border-gray-300 bg-gray-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, index)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, index)}
                onDragEnd={handleColumnDragEnd}
                >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <span className="text-sm font-medium text-gray-700">Columna {index + 1}</span>
                    <div className="flex gap-1">
                        <button
                        onClick={() => {
                            if (index > 0) {
                            const newColumns = [...(element.config?.columns || [])];
                            const temp = newColumns[index];
                            newColumns[index] = newColumns[index - 1];
                            newColumns[index - 1] = temp;
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }
                        }}
                        disabled={index === 0}
                        className={`px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-center ${
                            index === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                        }`}
                        title="Mover hacia arriba"
                        >
                        <ArrowUp size={14} />
                        </button>
                        <button
                        onClick={() => {
                            if (index < (element.config?.columns || []).length - 1) {
                            const newColumns = [...(element.config?.columns || [])];
                            const temp = newColumns[index];
                            newColumns[index] = newColumns[index + 1];
                            newColumns[index + 1] = temp;
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }
                        }}
                        disabled={index === (element.config?.columns || []).length - 1}
                        className={`px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center justify-center ${
                            index === (element.config?.columns || []).length - 1 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                        }`}
                        title="Mover hacia abajo"
                        >
                        <ArrowDown size={14} />
                        </button>
                    </div>
                    </div>
                    <button
                    onClick={() => {
                        const newColumns = (element.config?.columns || []).filter((_: TableColumn, i: number) => i !== index);
                        updateElement({ 
                        config: { 
                            ...element.config, 
                            columns: newColumns 
                        } 
                        });
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center justify-center transition-all duration-200 shadow-sm"
                    title="Eliminar columna"
                    >
                    <X size={14} />
                    </button>
                </div>
                                            <div className="space-y-2">
                    <input
                    type="text"
                    value={column.header}
                    onChange={(e) => {
                        const newColumns = [...(element.config?.columns || [])];
                        newColumns[index] = { ...newColumns[index], header: e.target.value };
                        updateElement({ 
                        config: { 
                            ...element.config, 
                            columns: newColumns 
                        } 
                        });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Encabezado de la columna"
                    />
                    <input
                    type="text"
                    value={column.property}
                    onChange={(e) => {
                        const newColumns = [...(element.config?.columns || [])];
                        newColumns[index] = { ...newColumns[index], property: e.target.value };
                        updateElement({ 
                        config: { 
                            ...element.config, 
                            columns: newColumns 
                        } 
                        });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Propiedad del JSON (ej: nombre)"
                    />
                </div>
                
                {/* Configuraciones adicionales de la columna */}
                <div className="pt-2 border-t border-gray-200">
                    <div className="space-y-2">
                    {/* Alineación */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Alineación:</label>
                        <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                            key={align}
                            onClick={() => {
                                const newColumns = [...(element.config?.columns || [])];
                                newColumns[index] = { 
                                ...newColumns[index], 
                                textAlign: align 
                                };
                                updateElement({ 
                                config: { 
                                    ...element.config, 
                                    columns: newColumns 
                                } 
                                });
                            }}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors flex items-center justify-center ${
                                column.textAlign === align 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            title={`Alinear ${align === 'left' ? 'izquierda' : align === 'center' ? 'centro' : 'derecha'}`}
                            >
                            {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                            </button>
                        ))}
                        </div>
                    </div>
                    
                    {/* Negrita */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estilo:</label>
                        <div className="flex gap-1">
                        <button
                            onClick={() => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                bold: !column.bold 
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                            column.bold 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            title="Negrita"
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            onClick={() => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                italic: !column.italic 
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                            column.italic 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            title="Cursiva"
                        >
                            <em>I</em>
                        </button>
                        </div>
                    </div>
                    
                    {/* Formateo */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Formato:</label>
                        <select
                        value={column.format || 'text'}
                        onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                            ...newColumns[index], 
                            format: e.target.value as any,
                            formatOptions: newColumns[index].formatOptions || {}
                            };
                            updateElement({ 
                            config: { 
                                ...element.config, 
                                columns: newColumns 
                            } 
                            });
                        }}
                        className="w-full px-2 py-1 border rounded text-xs text-black"
                        >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="currency">Moneda</option>
                        <option value="percentage">Porcentaje</option>
                        <option value="date">Fecha</option>
                        <option value="datetime">Fecha y Hora</option>
                        <option value="uppercase">Mayúsculas</option>
                        <option value="lowercase">Minúsculas</option>
                        <option value="capitalize">Capitalizar</option>
                        <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    
                    {/* Opciones específicas según el formato */}
                    {column.format === 'number' && (
                        <div className="space-y-1">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Decimales:</label>
                            <input
                            type="number"
                            min="0"
                            max="10"
                            value={column.formatOptions?.decimals || 0}
                            onChange={(e) => {
                                const newColumns = [...(element.config?.columns || [])];
                                newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                    ...newColumns[index].formatOptions,
                                    decimals: Number(e.target.value)
                                }
                                };
                                updateElement({ 
                                config: { 
                                    ...element.config, 
                                    columns: newColumns 
                                } 
                                });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                            />
                        </div>
                        <label className="flex items-center text-xs">
                            <input
                            type="checkbox"
                            checked={column.formatOptions?.thousandsSeparator || false}
                            onChange={(e) => {
                                const newColumns = [...(element.config?.columns || [])];
                                newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                    ...newColumns[index].formatOptions,
                                    thousandsSeparator: e.target.checked
                                }
                                };
                                updateElement({ 
                                config: { 
                                    ...element.config, 
                                    columns: newColumns 
                                } 
                                });
                            }}
                            className="mr-1"
                            />
                            Separador de miles
                        </label>
                        </div>
                    )}
                    
                    {column.format === 'currency' && (
                        <div>
                        <label className="block text-xs font-medium text-gray-700">Moneda:</label>
                        <select
                            value={column.formatOptions?.currency || 'MXN'}
                            onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                ...newColumns[index].formatOptions,
                                currency: e.target.value as any
                                }
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                        >
                            <option value="MXN">Peso Mexicano ($)</option>
                            <option value="USD">Dólar Americano ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                        </div>
                    )}
                    
                    {column.format === 'date' && (
                        <div>
                        <label className="block text-xs font-medium text-gray-700">Formato:</label>
                        <input
                            type="text"
                            value={column.formatOptions?.dateFormat || 'DD/MM/YYYY'}
                            onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                ...newColumns[index].formatOptions,
                                dateFormat: e.target.value
                                }
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                            placeholder="DD/MM/YYYY"
                        />
                        </div>
                    )}
                    
                    {column.format === 'datetime' && (
                        <div>
                        <label className="block text-xs font-medium text-gray-700">Formato:</label>
                        <input
                            type="text"
                            value={column.formatOptions?.dateFormat || 'DD/MM/YYYY HH:mm'}
                            onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                ...newColumns[index].formatOptions,
                                dateFormat: e.target.value
                                }
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                            placeholder="DD/MM/YYYY HH:mm"
                        />
                        </div>
                    )}
                    
                    {column.format === 'custom' && (
                        <div>
                        <label className="block text-xs font-medium text-gray-700">Formato personalizado:</label>
                        <input
                            type="text"
                            value={column.formatOptions?.customFormat || ''}
                            onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                ...newColumns[index].formatOptions,
                                customFormat: e.target.value
                                }
                            };
                                updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                            placeholder="ej: {value} ({length} chars)"
                        />
                        </div>
                    )}
                    
                    {/* Valor por defecto */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Valor por defecto:</label>
                        <input
                        type="text"
                        value={column.formatOptions?.defaultValue || ''}
                        onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                            ...newColumns[index], 
                            formatOptions: {
                                ...newColumns[index].formatOptions,
                                defaultValue: e.target.value
                            }
                            };
                            updateElement({ 
                            config: { 
                                ...element.config, 
                                columns: newColumns 
                            } 
                            });
                        }}
                        className="w-full px-2 py-1 border rounded text-xs text-black"
                        placeholder="Valor cuando no hay datos"
                        />
                    </div>
                    
                    {/* Transformaciones de texto */}
                    {(column.format === 'text' || !column.format) && (
                        <div>
                        <label className="block text-xs font-medium text-gray-700">Transformación:</label>
                        <select
                            value={column.formatOptions?.transform || 'none'}
                            onChange={(e) => {
                            const newColumns = [...(element.config?.columns || [])];
                            newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                ...newColumns[index].formatOptions,
                                transform: e.target.value === 'none' ? undefined : e.target.value as any
                                }
                            };
                            updateElement({ 
                                config: { 
                                ...element.config, 
                                columns: newColumns 
                                } 
                            });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black"
                        >
                            <option value="none">Ninguna</option>
                            <option value="truncate">Truncar</option>
                            <option value="ellipsis">Con puntos suspensivos</option>
                        </select>
                        {(column.formatOptions?.transform === 'truncate' || column.formatOptions?.transform === 'ellipsis') && (
                            <input
                            type="number"
                            min="1"
                            value={column.formatOptions?.maxLength || 50}
                            onChange={(e) => {
                                const newColumns = [...(element.config?.columns || [])];
                                newColumns[index] = { 
                                ...newColumns[index], 
                                formatOptions: {
                                    ...newColumns[index].formatOptions,
                                    maxLength: Number(e.target.value)
                                }
                                };
                                updateElement({ 
                                config: { 
                                    ...element.config, 
                                    columns: newColumns 
                                } 
                                });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs text-black mt-1"
                            placeholder="Longitud máxima"
                            />
                        )}
                        </div>
                    )}
                    </div>
                </div>
                </div>
            ))}
            <button
                onClick={() => {
                const newColumns = [...(element.config?.columns || []), { header: '', property: '' }];
                updateElement({ 
                    config: { 
                    ...element.config, 
                    columns: newColumns 
                    } 
                });
                }}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-all duration-200 shadow-sm"
            >
                + Agregar Columna
            </button>
            </div>
        </div>
        )}
    </>
  );
};

export default TableProperties;
