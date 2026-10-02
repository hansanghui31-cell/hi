import React, { useState } from 'react';
import { SeminarConfig } from '../types';
import { X, Check, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { initialSeminarConfig } from '../data/defaultConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SeminarConfig;
  onSave: (newConfig: SeminarConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<SeminarConfig>(config);

  if (!isOpen) return null;

  const handleResetToDefault = () => {
    setFormData(initialSeminarConfig);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updated = [...formData.sessions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, sessions: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              세미나 정보 및 세션 내용 커스터마이징
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              여기서 수정한 내용은 라이브 폼, 발송 이메일, 그리고 생성되는 GAS 코드에 즉시 반영됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Basic Seminar Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-indigo-400 text-xs uppercase tracking-wider">
              기본 세미나 개요
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">세미나 행사명</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">행사 부제목</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">주최 부서 / 기업명</label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">행사 일시</label>
                <input
                  type="text"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">오프라인 장소</label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">온라인 Zoom / Meet 링크</label>
                <input
                  type="text"
                  value={formData.zoomLink}
                  onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-indigo-400 text-xs uppercase tracking-wider">
              참석 세션 목록 (3개)
            </h4>

            {formData.sessions.map((session, index) => (
              <div key={session.id} className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="text-indigo-400">{session.code}</span>
                  <input
                    type="text"
                    value={session.badge}
                    onChange={(e) => updateSession(index, 'badge', e.target.value)}
                    placeholder="태그/배지"
                    className="w-24 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-right text-indigo-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">세션 제목</label>
                    <input
                      type="text"
                      value={session.title}
                      onChange={(e) => updateSession(index, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">강사명</label>
                    <input
                      type="text"
                      value={session.speaker}
                      onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">세션 상세 설명</label>
                  <textarea
                    value={session.description}
                    onChange={(e) => updateSession(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">담당자 이메일</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">문의 직통 번호</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Vercel / Live GAS Endpoint (Optional) */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              배포된 Google Apps Script 웹앱 URL <span className="text-slate-500 font-normal">(선택 사항 / 베셀 배포 시 연동)</span>
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={formData.gasApiUrl || ''}
              onChange={(e) => setFormData({ ...formData, gasApiUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm font-mono placeholder-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              이 웹앱을 Vercel에 배포한 후 실제 구글 시트와 통신하게 하려면 구글에서 발급받은 웹앱 URL을 입력하세요. 미입력 시 브라우저 내 시뮬레이터로 자동 동작합니다.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본값으로 되돌리기</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>설정 적용하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
