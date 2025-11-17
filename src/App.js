import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const CATEGORIES = ["Comida", "Transporte", "Ocio", "Hogar", "Salud", "Otros"];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF4560'];

function App() {
  // Estado para los gastos, inicializado desde localStorage
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  // Estados para los campos del formulario
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [person, setPerson] = useState('');

  // Estado para saber qué gasto se está editando
  const [editingId, setEditingId] = useState(null);

  // Estados para el filtrado y ordenamiento
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('date-desc');

  // Guardar en localStorage cada vez que los gastos cambien
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Limpia el formulario
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().slice(0, 10));
    setPerson('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !category || !date || !person) return;

    if (editingId) {
      // --- Lógica de Actualización ---
      const updatedExpenses = expenses.map(exp =>
        exp.id === editingId
          ? { ...exp, description, amount: parseFloat(amount), category, date, person }
          : exp
      );
      setExpenses(updatedExpenses);
      setEditingId(null);
    } else {
      // --- Lógica de Creación ---
      const newExpense = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        category,
        date,
        person,
      };
      setExpenses([...expenses, newExpense]);
    }
    resetForm();
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date);
    setPerson(expense.person);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const data = CATEGORIES.map(cat => ({ name: cat, value: 0 }));
    expenses.forEach(exp => {
      const categoryIndex = data.findIndex(item => item.name === exp.category);
      if (categoryIndex !== -1) {
        data[categoryIndex].value += exp.amount;
      }
    });
    return data.filter(item => item.value > 0);
  }, [expenses]);

  // Aplicar filtrado y ordenamiento
  const processedExpenses = useMemo(() => {
    let filtered = expenses;
    if (filterCategory !== 'Todas') {
      filtered = expenses.filter(exp => exp.category === filterCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [expenses, filterCategory, sortOrder]);

  // Calcular el total de gastos (ahora sobre los gastos filtrados)
  const totalExpenses = useMemo(() => {
    return processedExpenses.reduce((total, exp) => total + exp.amount, 0).toFixed(2);
  }, [processedExpenses]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Control de Gastos Personales</h1>
      </header>
      <main>
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Descripción del gasto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-full-width"
          />
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Persona"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            required
          />
          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editingId ? 'Actualizar Gasto' : 'Agregar Gasto'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="visualization-section">
          <div className="summary">
            <h2>Gasto Total (Filtrado): <span>${totalExpenses}</span></h2>
          </div>

          <div className="chart-container">
            <h3>Distribución de Gastos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="controls">
          <div className="control-group">
            <label htmlFor="filter">Filtrar por Categoría:</label>
            <select id="filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="Todas">Todas</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="sort">Ordenar por:</label>
            <select id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="date-desc">Fecha (Más reciente)</option>
              <option value="date-asc">Fecha (Más antiguo)</option>
              <option value="amount-desc">Monto (Mayor a menor)</option>
              <option value="amount-asc">Monto (Menor a mayor)</option>
            </select>
          </div>
        </div>

        <div className="expense-table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Persona</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processedExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.description}</td>
                  <td>${exp.amount.toFixed(2)}</td>
                  <td>{exp.category}</td>
                  <td>{exp.date}</td>
                  <td>{exp.person}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(exp)}>Editar</button>
                    <button className="btn-delete" onClick={() => deleteExpense(exp.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
