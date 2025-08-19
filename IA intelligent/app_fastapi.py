from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# Initialisation API
app = FastAPI(title="Personnel IA Service")

# Charger le modèle
model = joblib.load("model_personnel.joblib")

FEATURE_COLUMNS = ["duree_event", "maxGuest", "personnel_count", "jours_apres_fin"]

class PersonnelPayload(BaseModel):
    duree_event: float
    maxGuest: int
    personnel_count: int
    jours_apres_fin: int

@app.post("/predict-delete")
def predict_delete(payload: PersonnelPayload):
    df = pd.DataFrame([{
        "duree_event": payload.duree_event,
        "maxGuest": payload.maxGuest,
        "personnel_count": payload.personnel_count,
        "jours_apres_fin": payload.jours_apres_fin
    }], columns=FEATURE_COLUMNS)

    proba = model.predict_proba(df)[0][1]  # probabilité "supprimer"
    prediction = model.predict(df)[0]

    return {
        "delete": bool(prediction),
        "probability": round(float(proba), 2)
    }
