import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin } from "lucide-react";

// FarmLocationMapProps removed - using plain JS

const FarmLocationMap = ({ address, farmName }) => {
  const openInMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const openInOSM = () => {
    const encodedAddress = encodeURIComponent(address);
    const osmUrl = `https://www.openstreetmap.org/search?query=${encodedAddress}`;
    window.open(osmUrl, '_blank');
  };

  if (!address) {
    return (
      <div className="w-full h-[200px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No location available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Farm Location</p>
        {farmName && (
          <p className="text-sm text-muted-foreground">{farmName}</p>
        )}
      </div>
      
      {/* Map Preview */}
      <div className="relative w-full h-[250px] rounded-lg overflow-hidden border">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=77.3,21.2,77.4,21.3&layer=mapnik&marker=21.25,77.35`}
          className="w-full h-full border-0"
          title={`Map of ${address}`}
        />
        
        {/* Address overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium truncate">{address}</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={openInMaps} className="flex-1">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Google Maps
        </Button>
        <Button variant="outline" size="sm" onClick={openInOSM} className="flex-1">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in OpenStreetMap
        </Button>
      </div>
    </div>
  );
};

export default FarmLocationMap;