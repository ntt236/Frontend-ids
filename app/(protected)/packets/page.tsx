"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, formatConfidence } from "@/lib/formatters";
import { MoreHorizontal, Trash2, Eye, Plus, X } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppStore";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { packetService } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { PageResponse, PacketResponse } from "@/types";

export default function PacketsPage() {
  const isAdmin = useAppSelector(selectIsAdmin);
  const [packets, setPackets] = useState<PacketResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [labelFilter, setLabelFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  // Form state for Inject Packet
  const [injectData, setInjectData] = useState({
    srcIp: "192.168.1.42",
    dstIp: "10.0.0.33",
    srcPort: 33456,
    dstPort: 0,
    protocol: "ICMP",
    duration: 0.0,
    land: 0,
    wrongFragment: 0,
    urgent: 0,
  });

  const fetchPacketsData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (labelFilter !== "ALL") params.label = labelFilter;
      
      const res = await packetService.getAll(params);
      const data = res.data as PageResponse<PacketResponse>;
      setPackets(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch packets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacketsData();
  }, [page, labelFilter]);

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this packet log?")) return;
    try {
      await packetService.delete(id);
      toast.success("Packet deleted");
      fetchPacketsData(); // Refresh list
    } catch {
      toast.error("Failed to delete packet");
    }
  };

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    try {
      const res = await packetService.analyze(injectData);
      const result = res.data as PacketResponse;
      toast.success(`Packet injected! Result: ${result.label.toUpperCase()}`);
      setIsInjectModalOpen(false);
      fetchPacketsData();
    } catch (error) {
      toast.error("Failed to inject packet");
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Packets Log</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total Packets: <span className="font-medium text-foreground">{totalElements}</span>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsInjectModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Inject Packet
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Network Traffic</CardTitle>
            <div className="flex gap-2">
              <Select value={labelFilter} onValueChange={(v) => { setLabelFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Labels</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="attack">Attack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Source IP</TableHead>
                  <TableHead>Dest IP</TableHead>
                  <TableHead>Proto</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Captured At</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : packets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No packets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  packets.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="font-mono text-xs">{p.srcIp}</TableCell>
                      <TableCell className="font-mono text-xs">{p.dstIp}</TableCell>
                      <TableCell>{p.protocol}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.label === "normal" ? "success" : "destructive"}
                          className="mr-2"
                        >
                          {p.label.toUpperCase()}
                        </Badge>
                        {p.label === "attack" && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {p.attackType}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={p.confidence > 0.9 ? "text-emerald-500 font-medium" : p.confidence > 0.7 ? "text-amber-500 font-medium" : "text-destructive font-medium"}>
                        {formatConfidence(p.confidence)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={p.message || ""}>
                        {p.message || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTime(p.capturedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/packets/${p.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(p.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Packet
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Modal for Inject Packet */}
      {isInjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-lg relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={() => setIsInjectModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle>Inject Packet</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="srcIp">Source IP</Label>
                    <Input 
                      id="srcIp" 
                      value={injectData.srcIp} 
                      onChange={(e) => setInjectData({...injectData, srcIp: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dstIp">Destination IP</Label>
                    <Input 
                      id="dstIp" 
                      value={injectData.dstIp} 
                      onChange={(e) => setInjectData({...injectData, dstIp: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="srcPort">Source Port</Label>
                    <Input 
                      id="srcPort" 
                      type="number"
                      value={injectData.srcPort} 
                      onChange={(e) => setInjectData({...injectData, srcPort: Number(e.target.value)})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dstPort">Destination Port</Label>
                    <Input 
                      id="dstPort" 
                      type="number"
                      value={injectData.dstPort} 
                      onChange={(e) => setInjectData({...injectData, dstPort: Number(e.target.value)})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protocol">Protocol</Label>
                    <Select 
                      value={injectData.protocol} 
                      onValueChange={(v) => setInjectData({...injectData, protocol: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP</SelectItem>
                        <SelectItem value="UDP">UDP</SelectItem>
                        <SelectItem value="ICMP">ICMP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (s)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      step="0.1"
                      value={injectData.duration} 
                      onChange={(e) => setInjectData({...injectData, duration: Number(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" variant="outline" className="mr-2" onClick={() => setIsInjectModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInjecting}>
                    {isInjecting ? "Injecting..." : "Analyze Packet"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
