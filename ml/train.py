import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
data = pd.read_csv("data/dataset.csv")

# Example: adjust these based on your dataset
X = data.drop("Disease", axis=1)
y = data["Disease"]

# Encode labels
le = LabelEncoder()
y = le.fit_transform(y)

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = XGBClassifier()
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))

# Save model and label encoder
joblib.dump(model, "symptom_model.pkl")
joblib.dump(le, "label_encoder.pkl")

print("✅ Model trained and saved successfully!")
