import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, Vibration, Switch } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('cycles'); 
  
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

  // --- PARAMÈTRES ---
  const [themeMode, setThemeMode] = useState('dark'); 
  const [fontSizeOffset, setFontSizeOffset] = useState(0); 

  // --- CHRONO DE REPOS ---
  const [restTimeSetting, setRestTimeSetting] = useState(90); 
  const [activeRestTime, setActiveRestTime] = useState(null);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isResting && activeRestTime > 0) {
      interval = setInterval(() => {
        setActiveRestTime(prev => prev - 1);
      }, 1000);
    } else if (activeRestTime === 0) {
      setIsResting(false);
      Vibration.vibrate([0, 500, 200, 500]); 
    }
    return () => clearInterval(interval);
  }, [isResting, activeRestTime]);

  const startRestTimer = () => {
    setActiveRestTime(restTimeSetting);
    setIsResting(true);
  };

  // --- CHRONO & COMPTEUR GLOBAL ---
  const [amrapCount, setAmrapCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetAllCounterData = () => {
    setIsTimerRunning(false);
    setSecondsElapsed(0);
    setAmrapCount(0);
  };

  // --- PROFIL & HISTORIQUE DU POIDS ---
  const [profile, setProfile] = useState({ weight: '', height: '' });
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeightInput, setNewWeightInput] = useState('');

  const addWeightEntry = () => {
    if (!newWeightInput.trim()) return;
    const today = '26/10/2026';
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      weight: newWeightInput
    };
    setWeightHistory([newEntry, ...weightHistory]);
    setProfile({ ...profile, weight: newWeightInput });
    setNewWeightInput('');
  };

  // --- CYCLES & SÉANCES ---
  const [cycles, setCycles] = useState([
    {
      id: '1',
      name: 'Cycle Débutant : Full Body',
      workouts: [
        {
          id: 'w1',
          name: 'Full Body A',
          lastDate: 'Jamais faite',
          history: [],
          exercises: [
            { id: 'e1', name: 'Squat', sets: [{ weight: '47', value: '10' }] },
            { id: 'e2', name: 'Tirage vertical', sets: [{ weight: '40', value: '10' }] }
          ]
        }
      ]
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [inputVal1, setInputVal1] = useState(''); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null); 
  const [editNameVal, setEditNameVal] = useState('');

  const openAddModal = (type) => {
    setModalType(type);
    setInputVal1('');
    setModalVisible(true);
  };

  const handleAddItem = () => {
    if (!inputVal1.trim()) return;

    if (modalType === 'cycle') {
      setCycles([...cycles, { id: Date.now().toString(), name: inputVal1, workouts: [] }]);
    } else if (modalType === 'workout') {
      setCycles(cycles.map(c => {
        if (c.id === selectedCycleId) {
          return {
            ...c,
            workouts: [...c.workouts, { id: Date.now().toString(), name: inputVal1, lastDate: 'Jamais faite', history: [], exercises: [] }]
          };
        }
        return c;
      }));
    } else if (modalType === 'exercise') {
      setCycles(cycles.map(c => {
        if (c.id === selectedCycleId) {
          const works = c.workouts.map(w => {
            if (w.id === selectedWorkoutId) {
              return {
                ...w,
                exercises: [...(w.exercises || []), { id: Date.now().toString(), name: inputVal1, sets: [{ weight: '', value: '' }] }]
              };
            }
            return w;
          });
          return { ...c, workouts: works };
        }
        return c;
      }));
    }
    setModalVisible(false);
  };

  const openEditModal = (type, id, currentName) => {
    setEditingTarget({ type, id });
    setEditNameVal(currentName);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editNameVal.trim() || !editingTarget) return;
    const { type, id } = editingTarget;

    if (type === 'cycle') {
      setCycles(cycles.map(c => c.id === id ? { ...c, name: editNameVal } : c));
    } else if (type === 'workout') {
      setCycles(cycles.map(c => {
        if (c.id === selectedCycleId) {
          return { ...c, workouts: c.workouts.map(w => w.id === id ? { ...w, name: editNameVal } : w) };
        }
        return c;
      }));
    }
    setEditModalVisible(false);
  };

  const deleteCycle = (id) => setCycles(cycles.filter(c => c.id !== id));
  const deleteWorkout = (workId) => {
    setCycles(cycles.map(c => c.id === selectedCycleId ? { ...c, workouts: c.workouts.filter(w => w.id !== workId) } : c));
  };

  const currentCycle = cycles.find(c => c.id === selectedCycleId);
  const currentWorkout = currentCycle?.workouts.find(w => w.id === selectedWorkoutId);

  const updateExercisesInCurrentWorkout = (newExercises) => {
    setCycles(cycles.map(c => {
      if (c.id === selectedCycleId) {
        return { ...c, workouts: c.workouts.map(w => w.id === selectedWorkoutId ? { ...w, exercises: newExercises } : w) };
      }
      return c;
    }));
  };

  const finishAndSaveWorkout = () => {
    const today = '26/10/2026';
    const finishedWorkoutEntry = { id: Date.now().toString(), date: today, exercises: currentWorkout.exercises };
    const resetExercises = currentWorkout.exercises.map(ex => {
      const lastSet = ex.sets[ex.sets.length - 1] || { weight: '', value: '' };
      return { ...ex, sets: [{ weight: lastSet.weight, value: '' }] };
    });

    setCycles(cycles.map(c => {
      if (c.id === selectedCycleId) {
        return {
          ...c,
          workouts: c.workouts.map(w => w.id === selectedWorkoutId ? { ...w, lastDate: today, history: [finishedWorkoutEntry, ...(w.history || [])], exercises: resetExercises } : w)
        };
      }
      return c;
    }));

    alert('Séance enregistrée ! 🚀');
    setCurrentScreen('workouts');
  };

  // --- STYLES DYNAMIQUES SELON LE THÈME ---
  const isDark = themeMode === 'dark';
  const dynamicStyles = {
    container: { flex: 1, backgroundColor: isDark ? '#121212' : '#f5f6fa', paddingTop: 40 },
    headerTitle: { fontSize: 20 + fontSizeOffset, fontWeight: 'bold', color: isDark ? '#fff' : '#2f3640', textAlign: 'center', marginBottom: 15 },
    card: { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderRadius: 10, padding: 15, marginBottom: 12 },
    cardTitle: { color: isDark ? '#fff' : '#2f3640', fontSize: 18 + fontSizeOffset, fontWeight: 'bold' },
    textMain: { color: isDark ? '#fff' : '#2f3640', fontSize: 16 + fontSizeOffset },
    textSub: { color: isDark ? '#bbb' : '#555', fontSize: 14 + fontSizeOffset },
    input: { backgroundColor: isDark ? '#2a2a2a' : '#f1f2f6', color: isDark ? '#fff' : '#2f3640', padding: 10, borderRadius: 8, fontSize: 16 + fontSizeOffset }
  };

  // --- PARAMÈTRES (AVEC BOUTON SLIDE/SWITCH) ---
  if (currentScreen === 'settings') {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity onPress={() => setCurrentScreen('cycles')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>⚙️ Paramètres</Text>
        <ScrollView style={styles.scrollView}>
          <View style={[styles.profileCard, dynamicStyles.card]}>
            <Text style={[styles.profileCardTitle, dynamicStyles.cardTitle]}>Temps de repos par défaut (sec)</Text>
            <TextInput style={[styles.input, dynamicStyles.input]} keyboardType="numeric" value={restTimeSetting.toString()} onChangeText={(val) => setRestTimeSetting(parseInt(val) || 90)} />
          </View>
          <View style={[styles.profileCard, dynamicStyles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={[styles.profileCardTitle, dynamicStyles.cardTitle, { marginBottom: 2 }]}>Thème Sombre</Text>
              <Text style={[dynamicStyles.textSub, { fontSize: 12 }]}>{isDark ? 'Activé (Sombre)' : 'Désactivé (Clair)'}</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor={isDark ? "#f4f3f4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              value={isDark}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- PROFIL ---
  if (currentScreen === 'profile') {
    const weights = weightHistory.map(item => parseFloat(item.weight) || 0);
    const minW = weights.length > 0 ? Math.min(...weights) : 0;
    const maxW = weights.length > 0 ? Math.max(...weights) : 100;
    const range = maxW - minW;
    const maxHeight = 100;

    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity onPress={() => setCurrentScreen('cycles')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>👤 Mon Profil</Text>
        <ScrollView style={styles.scrollView}>
          <View style={[styles.profileCard, dynamicStyles.card]}>
            <Text style={[styles.profileCardTitle, dynamicStyles.cardTitle]}>Poids actuel : {profile.weight ? `${profile.weight} kg` : 'Non renseigné'}</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, dynamicStyles.input, { flex: 1, marginRight: 10 }]} placeholder="Nouveau poids..." placeholderTextColor={isDark ? "#888" : "#aaa"} keyboardType="numeric" value={newWeightInput} onChangeText={setNewWeightInput} />
              <TouchableOpacity style={styles.addBtn} onPress={addWeightEntry}><Text style={styles.btnTextWhite}>Valider</Text></TouchableOpacity>
            </View>
          </View>

          <View style={[styles.profileCard, dynamicStyles.card]}>
            <Text style={[styles.profileCardTitle, dynamicStyles.cardTitle]}>📈 Graphique de progression (Poids)</Text>
            <View style={[styles.chartBackgroundBox, { backgroundColor: isDark ? '#252525' : '#ffffff' }]}>
              {weightHistory.length === 0 ? (
                <Text style={[styles.emptyText, dynamicStyles.textSub, { paddingVertical: 40 }]}>Aucune pesée enregistrée pour le moment.</Text>
              ) : (
                <View style={styles.chartContainer}>
                  {weightHistory.slice().reverse().map((item, idx) => {
                    const val = parseFloat(item.weight) || 0;
                    let barHeight = 40;
                    if (range > 0) {
                      barHeight = Math.max(15, Math.min(maxHeight, ((val - minW) / range) * 80 + 20));
                    }
                    return (
                      <View key={idx} style={styles.chartBarColumn}>
                        <Text style={styles.chartBarValue}>{item.weight}</Text>
                        <View style={[styles.chartBarFill, { height: barHeight }]} />
                        <Text style={[styles.chartBarDate, dynamicStyles.textSub]}>{item.date.substring(0, 5)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CHRONO & COMPTEUR GLOBAL ---
  if (currentScreen === 'amrapCounter') {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity onPress={() => setCurrentScreen('cycles')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>

        <View style={styles.amrapFullContainer}>
          <Text style={[styles.amrapFullHeader, dynamicStyles.cardTitle]}>⏱️ Chrono & Séries Global</Text>
          
          <View style={[styles.chronoBox, dynamicStyles.card]}>
            <Text style={styles.chronoText}>{formatTime(secondsElapsed)}</Text>
            <View style={styles.chronoBtnsRow}>
              <TouchableOpacity 
                style={[styles.chronoCtrlBtn, isTimerRunning ? styles.btnStop : styles.btnStart]} 
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Text style={styles.chronoCtrlText}>{isTimerRunning ? 'Pause' : 'Lancer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chronoCtrlBtnReset} onPress={resetAllCounterData}>
                <Text style={styles.chronoCtrlTextReset}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.amrapGiantCircle, dynamicStyles.card]} onPress={() => setAmrapCount(amrapCount + 1)}>
            <Text style={styles.amrapGiantNumber}>{amrapCount}</Text>
            <Text style={[styles.amrapGiantLabel, dynamicStyles.textSub]}>SÉRIES VALIDÉES</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- HISTORIQUE DE SÉANCE ---
  if (currentScreen === 'workoutHistory') {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity onPress={() => setCurrentScreen('workouts')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>📜 Historique</Text>
        <ScrollView style={styles.scrollView}>
          {(!currentWorkout?.history || currentWorkout.history.length === 0) ? (
            <Text style={[styles.emptyText, dynamicStyles.textSub]}>Aucune réalisation.</Text>
          ) : (
            currentWorkout.history.map((item) => (
              <View key={item.id} style={[styles.historyCard, dynamicStyles.card]}>
                <Text style={styles.historyDate}>{item.date}</Text>
                {item.exercises.map((ex, idx) => (
                  <Text key={idx} style={[dynamicStyles.textSub, { fontSize: 14, marginTop: 4 }]}>• {ex.name}: {ex.sets.map((s, sIdx) => `#${sIdx+1} ${s.value} reps ${s.weight}kg`).join(' | ')}</Text>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CYCLES (ACCUEIL) ---
  if (currentScreen === 'cycles') {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.homeHeaderRow}>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle, { marginBottom: 0 }]}>🎯 Mes Cycles</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setCurrentScreen('profile')} style={[styles.topIconBtn, dynamicStyles.card, { marginRight: 8, padding: 8, marginBottom: 0 }]}><Text style={{fontSize: 16}}>👤</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={[styles.topIconBtn, dynamicStyles.card, { padding: 8, marginBottom: 0 }]}><Text style={{fontSize: 16}}>⚙️</Text></TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity style={[styles.card, dynamicStyles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#1a2634' : '#e3f2fd', borderWidth: 1, borderColor: '#007AFF' }]} onPress={() => setCurrentScreen('amrapCounter')}>
            <View>
              <Text style={[styles.cardTitle, dynamicStyles.cardTitle, { color: '#007AFF', fontSize: 16 }]}>⏱️ Chrono & Compteur Global</Text>
              <Text style={[dynamicStyles.textSub, { fontSize: 12, marginTop: 2 }]}>{amrapCount} séries validées - {formatTime(secondsElapsed)}</Text>
            </View>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainAddButton} onPress={() => openAddModal('cycle')}><Text style={styles.mainAddButtonText}>+ Nouveau Cycle</Text></TouchableOpacity>
          {cycles.map(cycle => (
            <View key={cycle.id} style={[styles.card, dynamicStyles.card]}>
              <TouchableOpacity style={styles.cardContent} onPress={() => { setSelectedCycleId(cycle.id); setCurrentScreen('workouts'); }}>
                <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{cycle.name}</Text>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal('cycle', cycle.id, cycle.name)}><Text style={styles.editText}>Modifier</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteCycle(cycle.id)}><Text style={styles.deleteText}>Supprimer</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        {renderModal()}
        {renderEditModal()}
      </SafeAreaView>
    );
  }

  // --- SÉANCES ---
  if (currentScreen === 'workouts') {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <TouchableOpacity onPress={() => setCurrentScreen('cycles')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>🏋️ {currentCycle?.name}</Text>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity style={styles.mainAddButton} onPress={() => openAddModal('workout')}><Text style={styles.mainAddButtonText}>+ Nouvelle Séance</Text></TouchableOpacity>
          {currentCycle?.workouts.map(work => (
            <View key={work.id} style={[styles.card, dynamicStyles.card]}>
              <TouchableOpacity style={styles.cardContent} onPress={() => { setSelectedWorkoutId(work.id); setCurrentScreen('tracker'); }}>
                <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{work.name}</Text>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectedWorkoutId(work.id); setCurrentScreen('workoutHistory'); }}><Text style={styles.workoutHistoryBtnText}>📜 Historique</Text></TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal('workout', work.id, work.name)}><Text style={styles.editText}>Modifier</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteWorkout(work.id)}><Text style={styles.deleteText}>Supprimer</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        {renderModal()}
        {renderEditModal()}
      </SafeAreaView>
    );
  }

  // --- SUIVI DE SÉANCE ---
  const exercises = currentWorkout?.exercises || [];
  
  const addSet = (exerciseId) => {
    updateExercisesInCurrentWorkout(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1] || { weight: '', value: '' };
        return { 
          ...ex, 
          sets: [...ex.sets, { weight: lastSet.weight, value: lastSet.value }] 
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId, setIndex) => {
    updateExercisesInCurrentWorkout(exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) } : ex));
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    updateExercisesInCurrentWorkout(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex][field] = value;
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <TouchableOpacity onPress={() => setCurrentScreen('workouts')} style={styles.backButton}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
      
      {/* BANDEAU DE REPOS FLOTTANT */}
      {isResting && (
        <View style={styles.floatingRestBanner}>
          <Text style={styles.floatingRestText}>⏳ Repos : <Text style={{color: '#2ed573'}}>{activeRestTime}s</Text></Text>
          <TouchableOpacity onPress={() => setIsResting(false)} style={styles.floatingRestStopBtn}><Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>Passer</Text></TouchableOpacity>
        </View>
      )}

      {/* EN-TÊTE DE SÉANCE */}
      <View style={styles.trackerTopBar}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle, {marginBottom: 0}]}>{currentWorkout?.name}</Text>
        <TouchableOpacity style={[styles.inlineRestBtn, dynamicStyles.card, {paddingVertical: 6, paddingHorizontal: 12, marginBottom: 0}]} onPress={startRestTimer}>
          <Text style={styles.inlineRestText}>⏱️ {restTimeSetting}s</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.mainAddButton} onPress={() => openAddModal('exercise')}><Text style={styles.mainAddButtonText}>+ Ajouter un exercice</Text></TouchableOpacity>

        {exercises.map((ex) => (
          <View key={ex.id} style={[styles.exerciseCard, dynamicStyles.card]}>
            <Text style={[styles.exerciseName, dynamicStyles.cardTitle]}>{ex.name}</Text>

            {ex.sets.map((set, index) => (
              <View key={index} style={styles.setRowClean}>
                <Text style={[styles.setNumClean, dynamicStyles.textSub]}>#{index + 1}</Text>
                
                <TextInput style={[styles.setInputClean, dynamicStyles.input]} keyboardType="numeric" placeholder="0" placeholderTextColor={isDark ? "#666" : "#aaa"} value={set.value} onChangeText={(val) => updateSet(ex.id, index, 'value', val)} />
                <Text style={[styles.unitText, dynamicStyles.textSub]}>reps</Text>

                <TextInput style={[styles.setInputClean, dynamicStyles.input]} keyboardType="numeric" placeholder="0" placeholderTextColor={isDark ? "#666" : "#aaa"} value={set.weight} onChangeText={(val) => updateSet(ex.id, index, 'weight', val)} />
                <Text style={[styles.unitText, dynamicStyles.textSub]}>kg</Text>

                <TouchableOpacity onPress={() => removeSet(ex.id, index)} style={styles.removeSetBtn}><Text style={styles.removeSetText}>✕</Text></TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={[styles.addSetBtnClean, {backgroundColor: isDark ? '#252525' : '#eaeaea'}]} onPress={() => addSet(ex.id)}><Text style={styles.addSetTextClean}>+ Série</Text></TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.finishWorkoutBigBtn} onPress={finishAndSaveWorkout}><Text style={styles.finishWorkoutBigBtnText}>🏁 Terminer la séance</Text></TouchableOpacity>
      </ScrollView>

      {renderModal()}
      {renderEditModal()}
    </SafeAreaView>
  );

  function renderModal() {
    return (
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, dynamicStyles.cardTitle]}>Ajouter</Text>
            <TextInput style={[styles.modalInput, dynamicStyles.input]} placeholder="Nom..." placeholderTextColor={isDark ? "#888" : "#aaa"} value={inputVal1} onChangeText={setInputVal1} autoFocus={true} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtnCancel, {backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0'}]} onPress={() => setModalVisible(false)}><Text style={[styles.modalBtnCancelText, {color: isDark ? '#bbb' : '#333'}]}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleAddItem}><Text style={styles.modalBtnConfirmText}>Créer</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function renderEditModal() {
    return (
      <Modal visible={editModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, dynamicStyles.cardTitle]}>Modifier</Text>
            <TextInput style={[styles.modalInput, dynamicStyles.input]} value={editNameVal} onChangeText={setEditNameVal} autoFocus={true} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtnCancel, {backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0'}]} onPress={() => setEditModalVisible(false)}><Text style={[styles.modalBtnCancelText, {color: isDark ? '#bbb' : '#333'}]}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleSaveEdit}><Text style={styles.modalBtnConfirmText}>OK</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  scrollView: { paddingHorizontal: 15 },
  backButton: { paddingHorizontal: 15, marginBottom: 5 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
  
  floatingRestBanner: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#2ed573', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, marginBottom: 8 },
  floatingRestText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  floatingRestStopBtn: { backgroundColor: '#ff5252', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 },

  trackerTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  inlineRestBtn: { borderWidth: 1, borderColor: 'transparent' },
  inlineRestText: { color: '#2ed573', fontWeight: 'bold', fontSize: 13 },

  homeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },

  mainAddButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  mainAddButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)', paddingTop: 8 },
  editText: { color: '#ffb142', marginRight: 15, fontSize: 13, fontWeight: 'bold' },
  deleteText: { color: '#ff5252', fontSize: 13, fontWeight: 'bold' },
  workoutHistoryBtnText: { color: '#007AFF', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },

  exerciseCard: { borderRadius: 8, padding: 12, marginBottom: 12 },
  exerciseName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  
  setRowClean: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  setNumClean: { width: 35, fontSize: 14, fontWeight: 'bold' },
  setInputClean: { width: 55, padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 15 },
  unitText: { fontSize: 13, marginHorizontal: 6, fontWeight: 'bold' },
  removeSetBtn: { padding: 4, width: 24, alignItems: 'center', marginLeft: 6 },
  removeSetText: { color: '#ff5252', fontSize: 14, fontWeight: 'bold' },
  
  addSetBtnClean: { alignItems: 'center', paddingVertical: 6, marginTop: 4, borderRadius: 6 },
  addSetTextClean: { color: '#007AFF', fontWeight: 'bold', fontSize: 12 },

  finishWorkoutBigBtn: { backgroundColor: '#2ed573', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 20 },
  finishWorkoutBigBtnText: { color: '#121212', fontSize: 15, fontWeight: 'bold' },

  profileCard: { borderRadius: 10, padding: 12, marginBottom: 12 },
  profileCardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row' },
  input: { flex: 1, padding: 10, borderRadius: 6, fontSize: 15 },
  addBtn: { backgroundColor: '#007AFF', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 6 },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  chartBackgroundBox: { borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140, paddingVertical: 10 },
  chartBarColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', height: '100%' },
  chartBarValue: { color: '#2ed573', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  chartBarFill: { width: 22, backgroundColor: '#007AFF', borderRadius: 4 },
  chartBarDate: { fontSize: 10, marginTop: 4 },

  historyCard: { borderRadius: 8, padding: 10, marginBottom: 10 },
  historyDate: { color: '#2ed573', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 14 },

  amrapFullContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  amrapFullHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  chronoBox: { padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20 },
  chronoText: { color: '#2ed573', fontSize: 35, fontWeight: 'bold', marginBottom: 10 },
  chronoBtnsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  chronoCtrlBtn: { backgroundColor: '#2ed573', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6, marginRight: 10 },
  btnStart: { backgroundColor: '#2ed573' },
  btnStop: { backgroundColor: '#ffb142' },
  chronoCtrlText: { color: '#121212', fontWeight: 'bold' },
  chronoCtrlBtnReset: { backgroundColor: '#2a2a2a', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6 },
  chronoCtrlTextReset: { color: '#ff5252', fontWeight: 'bold' },
  amrapGiantCircle: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#2ed573', marginBottom: 20 },
  amrapGiantNumber: { color: '#2ed573', fontSize: 45, fontWeight: 'bold' },
  amrapGiantLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 350, borderRadius: 12, padding: 15 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalInput: { padding: 10, borderRadius: 6, fontSize: 15, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtnCancel: { padding: 10, borderRadius: 6, alignItems: 'center', marginRight: 8, flex: 1 },
  modalBtnCancelText: { fontWeight: 'bold', fontSize: 14 },
  modalBtnConfirm: { flex: 1, backgroundColor: '#007AFF', padding: 10, borderRadius: 6, alignItems: 'center' },
  modalBtnConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});