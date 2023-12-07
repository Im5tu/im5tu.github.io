---
videoId: XMoNYQPi2k8
title: "The fastest .NET Serializer is NOT what you think"
date: 2022-08-28T05:45:02+01:00
---

Recently, I needed to compare the current performance of .NET serializers for a project. In this video, I compare the current state of the serializers and produce some interesting results.

Link to the benchmarks repository: <https://github.com/Im5tu/SerializationBenchmarks>

Json Serializers
_____________________

- Jil: <https://www.nuget.org/packages/Jil/>
- Newtonsoft.Json: <https://www.nuget.org/packages/Newtonsoft.Json>
- ServiceStack.Text: <https://www.nuget.org/packages/ServiceStack.Text>
- SpanJson: <https://www.nuget.org/packages/SpanJson>
- UTF8Json: <https://www.nuget.org/packages/Utf8Json>

Binary Serializers
_____________________

- AvroConvert: <https://www.nuget.org/packages/AvroConvert>
- Bebop: <https://www.nuget.org/packages/bebop>
- BSON: <https://www.nuget.org/packages/MongoDB.Bson>
- GroBuf: <https://www.nuget.org/packages/GroBuf>
- Hyperion: <https://www.nuget.org/packages/Hyperion>
- MessagePack: <https://www.nuget.org/packages/MessagePack>
- MsgPack: <https://www.nuget.org/packages/MsgPack.Cli>
- protobuf-net: <https://www.nuget.org/packages/protobuf-net>

<!--more-->

{{< youtube XMoNYQPi2k8 >}}
