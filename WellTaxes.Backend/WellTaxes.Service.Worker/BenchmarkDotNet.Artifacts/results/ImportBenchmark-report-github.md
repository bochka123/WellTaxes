```

BenchmarkDotNet v0.15.8, Windows 11 (10.0.22631.6199/23H2/2023Update/SunValley3)
12th Gen Intel Core i7-12700H 2.70GHz, 1 CPU, 20 logical and 14 physical cores
.NET SDK 10.0.103
  [Host]     : .NET 10.0.3 (10.0.3, 10.0.326.7603), X64 RyuJIT x86-64-v3 [AttachedDebugger]
  Job-CNUJVU : .NET 10.0.3 (10.0.3, 10.0.326.7603), X64 RyuJIT x86-64-v3

InvocationCount=1  UnrollFactor=1  

```
| Method            | Mean | Error |
|------------------ |-----:|------:|
| ImportWithService |   NA |    NA |
| ImportWithMediatR |   NA |    NA |

Benchmarks with issues:
  ImportBenchmark.ImportWithService: Job-CNUJVU(InvocationCount=1, UnrollFactor=1)
  ImportBenchmark.ImportWithMediatR: Job-CNUJVU(InvocationCount=1, UnrollFactor=1)
