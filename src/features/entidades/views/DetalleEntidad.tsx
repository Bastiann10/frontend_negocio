// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Phone, Mail, MapPin, IdCard, ChevronDown, ChevronUp, Edit, ArrowLeft, AlertTriangle, Link, Building2, Power, Plus, MoreVertical, Activity, Calendar, Check, History } from 'lucide-react';
import { getEntidadById, getEntidadAlertas, activateEntidad, deactivateEntidad, obtenerEstadoTrimestreEntidad, obtenerPreviewTrimestreEntidad, iniciarTrimestreEntidad } from '../services/entidad';
import type { PreviewTrimestreEntidadResponse } from '../services/entidad';
import { getLogEntidad } from '../../../core/services/logs';
import type { LogEntry } from '../../../core/services/logs';
import Loading from '../../../core/components/Loading';
import TipTapEditor from '../../../core/components/TipTapEditor';
import LogModal from '../../../core/components/LogModal';
import { formatChileanRut, formatChileanPhone } from '../../../core/utils/format';
import EditarEntidadModal from '../components/EditarEntidadModal';
import PreviewTrimestreModal from '../../../core/components/PreviewTrimestreModal';
import SmartImage from '../../../core/components/SmartImage';
import { ESTADOS_ASIGNACION_TLD } from '../../../core/config/estados';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface DetalleEntidadPageProps {
  embedded?: boolean;
  entidadIdProp?: number;
  onBack?: () => void;
}

export default function DetalleEntidadPage({ embedded = false, entidadIdProp, onBack }: DetalleEntidadPageProps = {}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const resolvedId = entidadIdProp ?? (id ? parseInt(id) : 1);

  const [entidadData, setEntidadData] = useState<any>(null);
  const [alertasData, setAlertasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openAccionesEntidad, setOpenAccionesEntidad] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [trimestreMessage, setTrimestreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [estadoTrimestre, setEstadoTrimestre] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTrimestreEntidadResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setEntidadData(null);
    setEstadoTrimestre(null);
    const fetchEntidad = async () => {
      try {
        const entidadId = resolvedId;
        const [response, alertas] = await Promise.all([
          getEntidadById(entidadId),
          getEntidadAlertas(entidadId),
        ]);
        setAlertasData(alertas);
        if (response.success && response.data) {
          const logoUrl = response.data.logo_url;
          const fullLogoUrl = logoUrl && logoUrl.startsWith('/') ? `${API_BASE_URL}${logoUrl}` : logoUrl;
          
          setEntidadData({
            ...response.data,
            logo_url: fullLogoUrl,
            direccion: response.data.direccion || 'No especificada',
            telefono: response.data.telefono || 'No especificado',
            correo: response.data.correo || 'No especificado',
            createdAt: response.data.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt || new Date().toISOString(),
            totalPersonalExpuesto: response.data.personal_expuesto?.total || 0,
            personalExpuestoActivo: response.data.personal_expuesto?.activo || 0,
            personalExpuestoInactivo: response.data.personal_expuesto?.inactivo || 0,
            totalAreas: response.data.areas?.total || 0,
            areasActivas: response.data.areas?.activas || 0,
            areasInactivas: response.data.areas?.inactivas || 0,
            tldActivas: response.data.tld?.total || 0,
            tldEstados: response.data.tld || {},
          });
        }
        try {
          const estado = await obtenerEstadoTrimestreEntidad(entidadId);
          setEstadoTrimestre(estado.trimestre_a_iniciar);
        } catch (err) {
          console.error('Error al obtener estado de trimestre:', err);
        }
      } catch (error) {
        console.error('Error al cargar entidad:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntidad();
  }, [resolvedId]);

  const handleIniciarTrimestre = async () => {
    if (!entidadData?.id) return;
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const preview = await obtenerPreviewTrimestreEntidad(entidadData.id);
      setPreviewData(preview);
    } catch (error: any) {
      setTrimestreMessage({ type: 'error', text: error.message || 'Error al cargar preview' });
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando entidad..." />;
  }

  if (!entidadData) {
    return <div className="">No se encontró la entidad</div>;
  }

  const handleVerLog = async () => {
    if (!entidadData?.id) return;
    setShowLogModal(true);
    setLoadingLog(true);
    try {
      const response = await getLogEntidad(entidadData.id);
      setLogData(response.data);
    } catch (error) {
      console.error('Error al cargar log:', error);
      setLogData([]);
    } finally {
      setLoadingLog(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!entidadData?.id) return;
    try {
      setUpdatingEstado(true);
      const entidadId = entidadData.id;
      if (entidadData.estado === 1) {
        await deactivateEntidad(entidadId);
        setEntidadData((prev: any) => ({ ...prev, estado: 0 }));
      } else {
        await activateEntidad(entidadId);
        setEntidadData((prev: any) => ({ ...prev, estado: 1 }));
      }
    } catch (error) {
      console.error('Error al cambiar estado de entidad:', error);
    } finally {
      setUpdatingEstado(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-background ">
      {/* ZONA 1: Información General */}
      <div className="space-y-6">
        {!embedded && (
          <button
            onClick={() => navigate('/entidad/lista')}
            className="text-foreground-secondary hover:text-foreground flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={20} />
            Volver a lista de entidades
          </button>
        )}
        {embedded && onBack && (
          <button
            onClick={onBack}
            className="text-foreground-secondary hover:text-foreground flex items-center gap-2 cursor-pointer lg:hidden"
          >
            <ArrowLeft size={20} />
            Volver a la lista
          </button>
        )}
        {/* Header con identidad y acciones principales */}
        <div
          className="p-6 rounded-2xl bg-background-secondary border border-border"
          style={{
            borderTop: `4px solid ${entidadData.color_secundario || '#ffe66b'}`,
          }}
        >
          
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Identidad de la entidad */}
              <div className="flex items-start gap-4 flex-1">
                {entidadData.logo_url ? (
                  <SmartImage
                    src={entidadData.logo_url}
                    alt={`Logo ${entidadData.nombre}`}
                    className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 p-1.5"
                    imgClassName="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 bg-foreground/10 rounded-lg flex items-center justify-center shrink-0 p-1.5">
                    <Building2 size={28} className="text-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-semibold text-foreground">{entidadData.nombre}</h1>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-foreground-secondary">
                    <span>Creado: {new Date(entidadData.createdAt).toLocaleString('es-ES')}</span>
                    <span>•</span>
                    <span>Actualizado: {new Date(entidadData.updatedAt).toLocaleString('es-ES')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Información de contacto - fila ligera */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <IdCard size={16} className="text-foreground-secondary" />
                <span className="text-foreground-secondary">RUT:</span>
                <span className="text-foreground font-medium">{formatChileanRut(entidadData.rut)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-foreground-secondary" />
                <span className="text-foreground-secondary">Dirección:</span>
                <span className="text-foreground font-medium">{entidadData.direccion}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-foreground-secondary" />
                <span className="text-foreground-secondary">Teléfono:</span>
                <span className="text-foreground font-medium">{formatChileanPhone(entidadData.telefono)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-foreground-secondary" />
                <span className="text-foreground-secondary">Correo:</span>
                <span className="text-foreground font-medium">{entidadData.correo}</span>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="mt-4 flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Activity size={16} className="text-foreground-secondary" />
              <span className="text-foreground-secondary">Estado entidad:</span>
              {entidadData.estado === 1 ? (
                <span className="text-foreground font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Activo</span>
              ) : (
                <span className="text-foreground font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" /> Inactivo</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setOpenAccionesEntidad(!openAccionesEntidad)}
              title="Acciones"
              className="p-2 rounded-lg border border-border bg-background text-foreground hover:bg-foreground/5 cursor-pointer"
            >
              <MoreVertical size={18} />
            </button>
            {openAccionesEntidad && (
              <>
                <button
                  onClick={handleToggleEstado}
                  disabled={updatingEstado}
                  className={`px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2 rounded-lg whitespace-nowrap ${
                    entidadData.estado === 1
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-success hover:bg-success/10'
                  } ${updatingEstado ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={entidadData.estado === 1 ? 'Desactivar entidad' : 'Activar entidad'}
                >
                  <Power size={16} />
                  {entidadData.estado === 1 ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2 rounded-lg whitespace-nowrap"
                  title="Editar entidad"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={handleIniciarTrimestre}
                  className="px-3 py-1.5 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2 rounded-lg whitespace-nowrap"
                  title="Iniciar trimestre"
                >
                  <Calendar size={16} />
                  Iniciar Trimestre
                  {estadoTrimestre !== null && (
                    <span>({estadoTrimestre})</span>
                  )}
                </button>
                <button
                  onClick={handleVerLog}
                  className="px-3 py-1.5 text-sm text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-2 rounded-lg whitespace-nowrap"
                  title="Log de cambios"
                >
                  <History size={16} />
                  Log
                </button>
              </>
            )}
          </div>

          {trimestreMessage && (
            <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
              trimestreMessage.type === 'success'
                ? 'bg-success/10 text-success border border-success/30'
                : 'bg-danger/10 text-danger border border-danger/30'
            }`}>
              {trimestreMessage.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {trimestreMessage.text}
            </div>
          )}

          {/* Descripción integrada con separador sutil */}
          {entidadData.descripcion && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-foreground-secondary hover:text-foreground flex items-center gap-1 text-sm cursor-pointer"
                type="button"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Ocultar descripción</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Ver descripción</span>
                  </>
                )}
              </button>
              {isDescriptionExpanded && (
                <div className="mt-2">
                  <TipTapEditor content={entidadData.descripcion} onChange={() => {}} editable={false} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ZONA 2: Métricas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Métricas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-background-secondary border border-border">
            <div className="flex items-center justify-between">
              <div>
                <a
                  href={`/personal_expuesto/lista?entidadId=${entidadData.id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/personal_expuesto/lista?entidadId=${entidadData.id}`); }}
                  className="text-3xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors underline underline-offset-4"
                  title="Ver personal expuesto"
                >
                  {entidadData.totalPersonalExpuesto}
                </a>
                <p className="text-sm text-foreground-secondary">Personal expuesto</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium flex items-center gap-1.5 text-foreground-secondary">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {entidadData.personalExpuestoActivo || 0} Activos
                  </span>
                  <span className="text-sm font-medium flex items-center gap-1.5 text-foreground-secondary">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    {entidadData.personalExpuestoInactivo || 0} Inactivos
                  </span>
                </div>
              </div>
              <a
                href={`/personal_expuesto/crear?entidadId=${entidadData.id}`}
                onClick={(e) => { e.preventDefault(); navigate(`/personal_expuesto/crear?entidadId=${entidadData.id}`); }}
                className="text-foreground-secondary hover:text-foreground hover:bg-foreground/10 cursor-pointer p-1.5 rounded-lg transition-colors"
                title="Crear personal expuesto"
              >
                <Plus size={18} />
              </a>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-background-secondary border border-border">
            <div className="flex items-center justify-between">
              <div>
                <a
                  href={`/area/lista?entidadId=${entidadData.id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/area/lista?entidadId=${entidadData.id}`); }}
                  className="text-3xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors underline underline-offset-4"
                  title="Ver áreas"
                >
                  {entidadData.totalAreas}
                </a>
                <p className="text-sm text-foreground-secondary">Áreas</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium flex items-center gap-1.5 text-foreground-secondary">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {entidadData.areasActivas || 0} Activas
                  </span>
                  <span className="text-sm font-medium flex items-center gap-1.5 text-foreground-secondary">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    {entidadData.areasInactivas || 0} Inactivas
                  </span>
                </div>
              </div>
              <a
                href={`/area/crear?entidadId=${entidadData.id}`}
                onClick={(e) => { e.preventDefault(); navigate(`/area/crear?entidadId=${entidadData.id}`); }}
                className="text-foreground-secondary hover:text-foreground hover:bg-foreground/10 cursor-pointer p-1.5 rounded-lg transition-colors"
                title="Crear área"
              >
                <Plus size={18} />
              </a>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-background-secondary border border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <a
                  href={`/tld/lista?entidadId=${entidadData.id}`}
                  onClick={(e) => { if ((entidadData.tldActivas || 0) > 0) { e.preventDefault(); navigate(`/tld/lista?entidadId=${entidadData.id}`); } else { e.preventDefault(); } }}
                  className={`text-3xl font-semibold text-foreground transition-colors ${(entidadData.tldActivas || 0) > 0 ? 'cursor-pointer hover:text-primary underline underline-offset-4' : ''}`}
                  title={(entidadData.tldActivas || 0) > 0 ? 'Ver tarjetas TLD' : undefined}
                >
                  {entidadData.tldActivas || 0}
                </a>
                <p className="text-sm text-foreground-secondary">
                  {entidadData.tldActivas === 1 ? 'TLD Asociada' : 'TLDs Asociadas'}
                </p>
                {entidadData.tldEstados && entidadData.tldEstados.total > 0 && (
                  <div className="mt-2 space-y-1">
                    {ESTADOS_ASIGNACION_TLD.map((est) => {
                      const count = (entidadData.tldEstados as any)[`estado_${est.value}`] || 0;
                      if (count === 0) return null;
                      return (
                        <div key={est.value} className="flex items-center gap-2 text-sm text-foreground-secondary">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: est.color }} />
                          <span className="font-medium">{est.label}: <span className="text-foreground font-medium">{count}</span></span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <a
                href={`/tld/asociar?entidadId=${entidadData.id}`}
                onClick={(e) => { e.preventDefault(); navigate(`/tld/asociar?entidadId=${entidadData.id}`); }}
                className="text-foreground-secondary hover:text-foreground hover:bg-foreground/10 cursor-pointer p-1.5 rounded-lg transition-colors"
                title="Asociar TLD"
              >
                <Link size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ZONA 3: Alertas */}
      {alertasData && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Alertas</h2>
          {(() => {
            const alertasPorAnio = (alertasData.alertas_por_anio || []).filter((anio: any) =>
              anio.trimestres?.some((trim: any) => trim.areas?.length > 0)
            );

            if (alertasPorAnio.length === 0) {
              return (
                <p className="text-sm text-foreground-secondary p-3 rounded-lg bg-background-secondary">
                  {alertasData.message || 'No hay alertas'}
                </p>
              );
            }

            return (
              <div className="p-3 rounded-lg bg-background-secondary space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Período {alertasData.anio_actual} - T{alertasData.trimestre_actual}
                  </h3>
                </div>
                <div className="space-y-1">
                  {alertasPorAnio.map((anio: any) =>
                    anio.trimestres.map((trim: any) =>
                      trim.areas.map((area: any) => (
                        <div
                          key={`${anio.a_o}-${trim.trimestre}-${area.id}`}
                          className="flex items-center justify-between py-2 border-b border-border last:border-b-0 text-sm"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-foreground truncate">{area.nombre}</p>
                            <p className="text-xs text-foreground-secondary">{anio.a_o} - T{trim.trimestre}</p>
                          </div>
                          <div className="text-right text-xs text-foreground-secondary shrink-0">
                            <p>Trim: {area.trimestres_sin_cerrar_cantidad}</p>
                            <p>Asig: {area.asignaciones_sin_cerrar_cantidad}</p>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <EditarEntidadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async () => {
          try {
            setLoading(true);
            // Refresh entidad data after update
            const entidadId = resolvedId;
            const [response, alertas] = await Promise.all([
              getEntidadById(entidadId),
              getEntidadAlertas(entidadId),
            ]);
            setAlertasData(alertas);
            if (response.success && response.data) {
              const logoUrl = response.data.logo_url;
              const fullLogoUrl = logoUrl && logoUrl.startsWith('/') ? `${API_BASE_URL}${logoUrl}` : logoUrl;
              
              setEntidadData({
                ...response.data,
                logo_url: fullLogoUrl,
                direccion: response.data.direccion || 'No especificada',
                telefono: response.data.telefono || 'No especificado',
                correo: response.data.correo || 'No especificado',
                createdAt: response.data.createdAt || new Date().toISOString(),
                updatedAt: response.data.updatedAt || new Date().toISOString(),
                totalPersonalExpuesto: response.data.personal_expuesto?.total || 0,
                personalExpuestoActivo: response.data.personal_expuesto?.activo || 0,
                personalExpuestoInactivo: response.data.personal_expuesto?.inactivo || 0,
                totalAreas: response.data.areas?.total || 0,
                areasActivas: response.data.areas?.activas || 0,
                areasInactivas: response.data.areas?.inactivas || 0,
                tldActivas: response.data.tld?.total || 0,
            tldEstados: response.data.tld || {},
              });
            }
          } catch (error) {
            console.error('Error al recargar datos de entidad:', error);
          } finally {
            setLoading(false);
          }
        }}
        entidadData={entidadData}
        entidadId={resolvedId}
      />

      <PreviewTrimestreModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        groups={previewData?.areas.map(a => ({ nombre: a.nombre_area, personas: a.personas })) ?? []}
        total={previewData?.total_a_iniciar ?? 0}
        loading={previewLoading}
        onConfirm={() => iniciarTrimestreEntidad(entidadData?.id ?? 0)}
        onSuccess={(n) => {
          setTrimestreMessage({ type: 'success', text: `${n} trimestre(s) iniciado(s) correctamente.` });
          setEstadoTrimestre(0);
        }}
      />

      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        log={logData}
        loading={loadingLog}
        title="Log de entidad"
      />
    </div>
  );
}
