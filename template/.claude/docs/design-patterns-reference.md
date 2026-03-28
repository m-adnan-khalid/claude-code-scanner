# Design Principles & Patterns Reference

Extracted from @code-quality agent. Load on-demand during pre-implementation review or post-implementation audit.

## The 15 Core Design Principles

### SOLID Principles
| Principle | Rule | Red Flag | Fix |
|-----------|------|----------|-----|
| **SRP** | One reason to change per class | Class with 5+ unrelated public methods | Extract each responsibility |
| **OCP** | Open for extension, closed for modification | if/else chains growing with features | Strategy, Decorator, plugins |
| **LSP** | Subtypes replaceable for base types | Override throws NotImplementedException | Composition; honor contract |
| **ISP** | Don't force unused interface methods | Interface with 10+ methods, half stubbed | Split into role interfaces |
| **DIP** | Depend on abstractions | `new ConcreteService()` in business logic | Constructor injection + interfaces |

### Other Principles
| Principle | Rule | Red Flag |
|-----------|------|----------|
| **DRY** | Single authoritative representation | Same logic in 2+ places (but don't over-DRY different domains) |
| **KISS** | Simplest solution that works | Over-engineered abstractions, 5 classes for 1 function |
| **YAGNI** | Build only what's needed now | "Just in case" params, empty extension points |
| **SoC** | Each section handles one concern | Business logic in controllers, SQL in UI layer |
| **Encapsulation** | Hide internals, expose minimum | Public fields, leaked data structures |
| **Composition > Inheritance** | Combine objects over deep hierarchies | Inheritance depth >3, diamond problem |
| **Law of Demeter** | Talk only to immediate dependencies | `a.b().c().d()` train wrecks |
| **High Cohesion / Low Coupling** | Related stays together, minimize deps | God class, 15+ imports |
| **Fail Fast** | Detect errors early | Swallowed exceptions, null propagation |
| **Immutability** | Prefer immutable to avoid side effects | Shared mutable state, race conditions |

---

## 46 Design Patterns

### Creational (5)
| Pattern | When to Use | When NOT to Use |
|---------|-------------|-----------------|
| Singleton | True shared resources (config, pools) | Just for global access (use DI) |
| Factory Method | Creation varies by context | Trivial creation, only one type |
| Abstract Factory | Families of related objects | Families don't vary, premature complexity |
| Builder | Complex objects, many optional params | <4 params, simple objects |
| Prototype | Cloning cheaper than construction | Objects cheap to create |

### Structural (7)
| Pattern | When to Use | When NOT to Use |
|---------|-------------|-----------------|
| Adapter | Incompatible interfaces, legacy wrapping | Can modify source, already compatible |
| Bridge | Abstraction + implementation vary independently | Only one dimension varies |
| Composite | Tree structures (files, UI) | Not actually hierarchical |
| Decorator | Dynamic behavior addition, middleware | Subclassing is simpler |
| Facade | Simplify complex subsystems | Subsystem already simple |
| Flyweight | Many similar objects, memory pressure | Objects not similar, memory not bottleneck |
| Proxy | Lazy loading, caching, auth, logging | Direct access is fine |

### Behavioral (11)
| Pattern | When to Use | When NOT to Use |
|---------|-------------|-----------------|
| Chain of Responsibility | Pipeline/middleware handlers | Order doesn't matter, only one handler |
| Command | Undo/redo, queuing, transactions | Simple operations, no undoing |
| Iterator | Custom traversal without exposing structure | Simple arrays, built-in iteration |
| Mediator | Complex N-to-N communication | Objects talk to 1-2 others |
| Memento | Save/restore state, snapshots | State trivially reconstructable |
| Observer | Event-driven notification | One listener, performance-sensitive chains |
| State | Behavior changes with state | Few simple states |
| Strategy | Runtime algorithm selection | Only one algorithm |
| Template Method | Algorithm skeleton, customizable steps | Steps don't vary |
| Visitor | Add operations without modifying hierarchy | Hierarchy changes frequently |
| Interpreter | Domain-specific languages | Complex grammars |

### Architectural (5)
MVC, MVVM, Layered, Hexagonal/Ports & Adapters, Clean Architecture

### Distributed (7)
Event-Driven, Saga, CQRS, Event Sourcing, Microservices, API Gateway, Pub/Sub

### Resilience & Cloud (8)
Circuit Breaker, Bulkhead, Retry, Idempotency, Strangler Fig, Sidecar, BFF, Leader Election

### Data Access (3)
Repository, Unit of Work, Dependency Injection
