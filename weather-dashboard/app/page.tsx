
'use client'
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error } = useSWR('/api/weather', fetcher);

  if (error) return <div>Failed to load data</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className='items-center justify-center'>
      <h1 className='text-5xl text-center'>Weather Dashboard</h1>
      <table className=''>
        <thead className=''>
          <tr>
            <th>City</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Description</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record: any) => (
            <tr key={record.id}>
              <td>{record.city}</td>
              <td>{record.temperature}</td>
              <td>{record.humidity}</td>
              <td>{record.weather_description}</td>
              <td>{new Date(record.timestamp).toLocaleString()}</td>  
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
