import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Charger les données
df = pd.read_csv('personnel_history.csv')

# Features et target
X = df[['duree_event', 'maxGuest', 'personnel_count', 'jours_apres_fin']]
y = df['action_personnel'].apply(lambda x: 1 if x.strip().lower() == 'desactiver' else 0)

# Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Entraîner le modèle
model = RandomForestClassifier(
    n_estimators=200,  # un peu plus d’arbres
    max_depth=10,      # éviter l’overfitting
    random_state=42
)
model.fit(X_train, y_train)

# Évaluer
accuracy = model.score(X_test, y_test)
print(f"✅ Accuracy: {accuracy:.2f}")

# Sauvegarder le modèle
joblib.dump(model, 'model_personnel.joblib')
print("💾 Modèle sauvegardé dans model_personnel.joblib")
