---
layout: til
title: Trigger useQuery manually in react-query
date: 2022-10-03T21:30:00.677Z
---
The `useQuery` hook from [react-query](https://tanstack.com/query/v4) usually calls the fetch function on render. There are times when you need more control over when the query is called, for example on a button press. 

To trigger a query manually, set the query to `enabled: false` and then call the `refetch()` function once the query should be triggered.

```javascript
export default function MyComponent() {
  const { data, refetch } = useQuery('my_key', fetchThings, { enabled: false })

  const handleButtonPress = () => {
    refetch()
  }

  return <button onClick={handleButtonPress}>Fetch!</button>
}
```

[Docs](https://tanstack.com/query/v4/docs/reference/useQuery), [See also](https://stackoverflow.com/a/63113066)