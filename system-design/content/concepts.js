// Part 1: single theories and design methods, drilled one at a time before the
// business-scenario designs in topics.js. `level` drives how prominently a concept is shown:
//   core     — asked in almost every system-design interview; do these first
//   common   — comes up often, learn after the core ones
//   advanced — deeper topics for later
// `points` is internal guidance for the AI lesson / drill / evaluation, not shown as an answer.
export const LEVELS = {
  core: { label: '★ 核心', note: '几乎每场系统设计面试都会用到，优先练' },
  common: { label: '常见', note: '经常出现，核心练完后再练' },
  advanced: { label: '进阶', note: '深入话题，后期再练' },
};

export const GROUPS = ['估算与接口', '扩展与负载', '缓存', '数据与一致性', '异步与消息', '可靠性与稳定性', '安全与运维'];

export const CONCEPTS = [
  { id: 'capacity', group: '估算与接口', level: 'core', name: '容量估算', brief: 'QPS、存储、带宽的粗算方法', points: '日活到 QPS 的换算、峰值系数、读写比、单条数据大小到总存储、带宽估算、用估算结果决定是否需要分片/缓存' },
  { id: 'latency-metrics', group: '估算与接口', level: 'common', name: '延迟与性能指标', brief: '吞吐、P99、常见操作的耗时量级', points: '内存/SSD/网络/跨机房的耗时量级、吞吐与延迟的关系、平均值与 P99 的区别、利特尔法则' },
  { id: 'api-design', group: '估算与接口', level: 'common', name: 'API 设计', brief: 'REST/gRPC、分页、版本与错误码', points: '资源建模、REST 与 gRPC 取舍、游标分页与偏移分页、幂等的 HTTP 方法、版本演进、错误码与重试语义' },
  { id: 'unique-id', group: '估算与接口', level: 'common', name: '分布式唯一 ID', brief: '自增、UUID、雪花算法、号段', points: '数据库自增的瓶颈、UUID 的无序问题、雪花算法结构与时钟回拨、号段模式、趋势递增对索引的影响' },

  { id: 'stateless-scaling', group: '扩展与负载', level: 'core', name: '水平扩展与无状态服务', brief: '把状态移出服务节点，才能随意加机器', points: '垂直与水平扩展、会话状态外置、无状态节点的好处、有状态服务如何扩展、自动扩缩容的触发指标' },
  { id: 'load-balancing', group: '扩展与负载', level: 'core', name: '负载均衡', brief: 'L4/L7、常见算法与健康检查', points: '四层与七层的区别、轮询/加权/最少连接/哈希、会话保持、健康检查与摘除、客户端与服务端负载均衡' },
  { id: 'sharding', group: '扩展与负载', level: 'core', name: '分库分表与分片', brief: '数据量或写入超出单机时如何拆', points: '垂直拆分与水平拆分、分片键选择、范围/哈希分片、热点分片、跨分片查询与事务、扩容时的数据迁移' },
  { id: 'replication', group: '扩展与负载', level: 'core', name: '复制与读写分离', brief: '主从、多主、复制延迟', points: '主从复制、同步与异步复制、复制延迟带来的读不到自己写、多主冲突、故障切换与数据丢失窗口' },
  { id: 'consistent-hashing', group: '扩展与负载', level: 'common', name: '一致性哈希', brief: '增删节点时只迁移少量数据', points: '取模哈希的迁移问题、哈希环、虚拟节点与均衡、在缓存集群和分片中的使用' },

  { id: 'cache-patterns', group: '缓存', level: 'core', name: '缓存模式与失效', brief: '旁路缓存、读穿/写穿、写回、过期与淘汰', points: 'Cache-Aside 读写流程、先更新库还是先删缓存、延迟双删、TTL、LRU/LFU 淘汰、缓存与数据库的一致性取舍' },
  { id: 'cache-failures', group: '缓存', level: 'core', name: '缓存穿透、击穿与雪崩', brief: '三类缓存失效事故的成因与防护', points: '穿透（不存在的 key）与布隆过滤器/空值缓存、击穿（热点 key 过期）与互斥重建/逻辑过期、雪崩（大量同时过期或缓存宕机）与随机 TTL/多级缓存/降级' },
  { id: 'cdn', group: '缓存', level: 'common', name: 'CDN 与边缘缓存', brief: '静态与动态内容的就近分发', points: '回源、缓存键、失效与刷新、静态资源版本化、动态加速、成本' },

  { id: 'consistency-models', group: '数据与一致性', level: 'core', name: '一致性模型', brief: '强一致、最终一致、读己之写、单调读', points: '线性一致、顺序一致、最终一致、读己之写、单调读；不同业务需要哪种；如何在复制和缓存下实现' },
  { id: 'transactions', group: '数据与一致性', level: 'core', name: '事务与隔离级别', brief: 'ACID、四种隔离级别与并发异常', points: '脏读/不可重复读/幻读、四种隔离级别、MVCC、悲观锁与乐观锁（版本号）、丢失更新' },
  { id: 'distributed-transactions', group: '数据与一致性', level: 'core', name: '分布式事务', brief: '2PC、TCC、Saga、本地消息表/Outbox', points: '2PC 的阻塞问题、TCC 的三阶段、Saga 的补偿、本地消息表与 Outbox 保证消息与数据一致、如何选择' },
  { id: 'cap', group: '数据与一致性', level: 'common', name: 'CAP 与 PACELC', brief: '分区时一致性与可用性的取舍', points: 'CAP 的准确含义、分区发生时 CP 与 AP 的行为、PACELC 补充的延迟取舍、常见系统的定位' },
  { id: 'sql-nosql', group: '数据与一致性', level: 'common', name: '存储选型', brief: '关系库、KV、文档、列存、搜索引擎', points: '按访问模式选存储、事务需求、扩展方式、二级索引、全文检索、时序数据、多存储之间的同步' },
  { id: 'storage-engine', group: '数据与一致性', level: 'advanced', name: '索引与存储引擎', brief: 'B+ 树与 LSM 树的读写取舍', points: 'B+ 树结构与范围查询、LSM 的写放大与合并、读放大、布隆过滤器、为什么写多读少用 LSM' },

  { id: 'message-queue', group: '异步与消息', level: 'core', name: '消息队列与交付语义', brief: '至多一次、至少一次、"恰好一次"', points: '削峰、解耦、异步；三种交付语义；消费位移提交时机；顺序消息与分区；积压、死信与重放' },
  { id: 'idempotency', group: '异步与消息', level: 'core', name: '幂等设计', brief: '重复请求和重复消息只生效一次', points: '为什么至少一次投递需要幂等、幂等键/请求 ID、唯一约束、状态机约束、去重表的有效期、对外部系统的副作用' },
  { id: 'retry-timeout', group: '异步与消息', level: 'core', name: '超时、重试与退避', brief: '什么时候重试、重试几次、怎么避免重试风暴', points: '超时的设置依据、可重试与不可重试错误、指数退避与抖动、重试预算、重试放大与级联故障、超时传递' },
  { id: 'cqrs-events', group: '异步与消息', level: 'advanced', name: '事件驱动与 CQRS', brief: '用事件传播状态变化，读写模型分离', points: '事件通知与事件携带状态、事件溯源、读写模型分离的好处与最终一致代价、事件的版本演进' },

  { id: 'rate-limiting', group: '可靠性与稳定性', level: 'core', name: '限流', brief: '令牌桶、漏桶、固定/滑动窗口', points: '四种算法的行为差异与突发流量、单机与分布式限流、按用户/接口维度、被限流后的返回与客户端行为' },
  { id: 'circuit-breaker', group: '可靠性与稳定性', level: 'core', name: '熔断、降级与隔离', brief: '依赖出问题时保住核心功能', points: '熔断器三种状态、降级策略（默认值/缓存/关闭非核心功能）、舱壁隔离（线程池/连接池）、背压' },
  { id: 'distributed-lock', group: '可靠性与稳定性', level: 'common', name: '分布式锁', brief: '基于 Redis、数据库、ZooKeeper/etcd 的锁', points: '加锁原子性与过期时间、锁续期、误删别人的锁、fencing token、什么时候其实不需要锁' },
  { id: 'consensus', group: '可靠性与稳定性', level: 'advanced', name: '共识、选主与租约', brief: 'Raft 的基本思路与租约', points: '为什么需要多数派、Raft 的选主与日志复制、脑裂、租约与时钟、etcd/ZooKeeper 的用法' },

  { id: 'observability', group: '安全与运维', level: 'common', name: '可观测性与 SLO', brief: '指标、日志、链路追踪、告警', points: 'RED/USE 指标、结构化日志、Trace 与 Span、SLI/SLO/错误预算、告警的有效性、排障路径' },
  { id: 'authn-authz', group: '安全与运维', level: 'common', name: '认证与授权', brief: 'Session、JWT、OAuth2、RBAC/ABAC', points: 'Session 与 Token 取舍、JWT 的吊销问题、OAuth2 授权码流程、RBAC 与 ABAC、多租户隔离、密钥管理' },
];

export const conceptById = (id) => CONCEPTS.find((c) => c.id === id);
