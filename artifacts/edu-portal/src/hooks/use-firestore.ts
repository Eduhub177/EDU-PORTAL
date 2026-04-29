import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, query, QueryConstraint, orderBy, where, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export function useCollection<T>(path: string, ...queryConstraints: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, path), ...queryConstraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error(`Error subscribing to ${path}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, JSON.stringify(queryConstraints)]); // simplistic dependency check

  return { data, loading, error };
}

export function useDoc<T>(path: string, id: string | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !id) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, path, id),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error subscribing to ${path}/${id}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, id]);

  return { data, loading, error };
}
