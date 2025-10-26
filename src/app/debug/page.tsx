'use client'

export default function DebugPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">🚀 AgroFlow Debug</h1>
        <p className="text-gray-600 mb-4">Se você está vendo essa página, o Next.js está funcionando!</p>
        <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-700"><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          <p className="text-sm text-gray-700"><strong>Status:</strong> ✅ Página carregada</p>
          <p className="text-sm text-gray-700"><strong>JavaScript:</strong> ✅ Funcionando</p>
          <p className="text-sm text-gray-700"><strong>React:</strong> ✅ Renderizando</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  )
}
