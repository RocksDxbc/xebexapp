import React from 'react';
// Formulário de Cadastro de Encomenda (para o Admin)
const AdminPackageRegistrationForm = ({ setView, db, appId, residents }) => {
  const [residentId, setResidentId] = useState('');
  const [itemType, setItemType] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!residentId || !itemType) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const packagesCollectionRef = collection(db, `artifacts/${appId}/packages`);
      await addDoc(packagesCollectionRef, {
        residentId,
        itemType,
        date: new Date().toISOString(),
        imageUrl: imagePreview || null,
        status: 'received',
      });
      setMessage('Encomenda registrada com sucesso! Notificação enviada ao morador.');
      
      setResidentId('');
      setItemType('');
      setImage(null);
      setImagePreview(null);
    } catch (e) {
      console.error("Erro ao registrar encomenda:", e);
      setError('Erro ao registrar encomenda. Tente novamente.');
    }
  };

  return (
    <>
      <Navbar title="Registrar Encomenda" setView={setView} />
      <ScreenLayout>
        <Card title="Registrar Encomenda">
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Morador</label>
              <select
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione o Morador</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - Apt. {r.apartment}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Tipo de Item"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              placeholder="Ex: Carta, Caixa pequena, etc."
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagem do Item</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-2 text-center">
                  <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-md shadow-md" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pré-visualização da imagem</p>
                </div>
              )}
            </div>
            
            {message && <p className="text-green-500 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
            >
              Registrar
            </button>
            <button
              onClick={() => setView('admin-dashboard')}
              className="w-full mt-2 bg-gray-500 text-white py-2 rounded-md font-semibold hover:bg-gray-600 transition"
            >
              Voltar
            </button>
          </form>
        </Card>
      </ScreenLayout>
    </>
  );
};

export default AdminPackageRegistrationForm;